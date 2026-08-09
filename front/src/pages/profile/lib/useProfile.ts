import {useCallback, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import {useGetProductsByCustomerQuery} from '@entities/product';
import type {TProduct} from '@entities/product';
import {useGetCustomerRatingQuery, useGetReviewsByCustomerQuery} from '@entities/review';
import type {TReview} from '@entities/review';
import {useGetMyChainsQuery} from '@entities/chain';
import type {TChain} from '@entities/chain';
import {useGetProductsQuery} from '@entities/product';
import type {TUser} from '@entities/user';

export type TProfileTab = 'products' | 'exchanges' | 'reviews';

export type TProfileExchange = {
    chain: TChain;
    fromProduct?: TProduct;
    toProduct?: TProduct;
};

const maskEmail = (email: string): string => {
    const [name, domain] = email.split('@');
    if (!domain) return 'Пользователь';
    return `${name.slice(0, 2)}***@${domain}`;
};

export const useProfile = (user?: TUser, isOwner = false) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TProfileTab>('products');
    const customerId = user?.customer_id ?? '';

    const productsQuery = useGetProductsByCustomerQuery(customerId, {skip: !customerId});
    const ratingQuery = useGetCustomerRatingQuery(customerId, {skip: !customerId});
    const reviewsQuery = useGetReviewsByCustomerQuery(customerId, {skip: !customerId});
    const chainsQuery = useGetMyChainsQuery(undefined, {skip: !customerId || !isOwner});
    const allProductsQuery = useGetProductsQuery({limit: 100}, {skip: !customerId || !isOwner});

    const receivedProducts = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
    const reviews = useMemo<TReview[]>(() => reviewsQuery.data ?? [], [reviewsQuery.data]);

    const products = useMemo(
        () => receivedProducts.filter(({status}) => status !== 'archived'),
        [receivedProducts],
    );

    // Резолвим товары сделок пользователя из общего списка.
    const productsById = useMemo(() => {
        const map = new Map<string, TProduct>();
        for (const product of receivedProducts) {
            map.set(product.product_id, product);
        }
        for (const product of allProductsQuery.data ?? []) {
            map.set(product.product_id, product);
        }
        return map;
    }, [allProductsQuery.data, receivedProducts]);

    const exchanges = useMemo<TProfileExchange[]>(() => {
        const chains = chainsQuery.data ?? [];
        return chains
            .map((chain) => ({
                chain,
                fromProduct: productsById.get(chain.from_product_id),
                toProduct: productsById.get(chain.to_product_id),
            }))
            .sort((a, b) => b.chain.updated_at.localeCompare(a.chain.updated_at));
    }, [chainsQuery.data, productsById]);

    const maskedName = useMemo(
        () => (isOwner && user?.email ? user.email : user?.email ? maskEmail(user.email) : ''),
        [isOwner, user?.email],
    );

    const openProduct = useCallback(
        (productId: string) => navigate(`/product/${productId}`),
        [navigate],
    );

    const openEditProduct = useCallback(
        (productId: string) => navigate(`/product/${productId}/edit`),
        [navigate],
    );

    const openExchange = useCallback(
        (chainId: string) => navigate(`/exchanges/${chainId}`),
        [navigate],
    );

    const openExchanges = useCallback(() => navigate('/exchanges'), [navigate]);

    const openCreate = useCallback(() => navigate('/create'), [navigate]);

    const getTabCount = useCallback(
        (tab: TProfileTab): number => {
            if (tab === 'products') return products.length;
            if (tab === 'exchanges') return exchanges.length;
            return reviews.length;
        },
        [products.length, exchanges.length, reviews.length],
    );

    return {
        activeTab,
        setActiveTab,
        products,
        reviews,
        exchanges,
        rating: ratingQuery.data?.average_rating ?? 0,
        reviewsCount: reviews.length,
        isProductsLoading: productsQuery.isLoading,
        isProductsError: productsQuery.isError,
        isReviewsLoading: reviewsQuery.isLoading,
        isReviewsError: reviewsQuery.isError,
        isExchangesLoading: isOwner && (chainsQuery.isLoading || allProductsQuery.isLoading),
        isExchangesError: isOwner && (chainsQuery.isError || allProductsQuery.isError),
        // представление
        maskedName,
        getTabCount,
        // навигация
        openProduct,
        openEditProduct,
        openExchange,
        openExchanges,
        openCreate,
    };
};
