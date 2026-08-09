import {useMemo, useState} from 'react';

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

export const useProfile = (user?: TUser, isOwner = false) => {
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

    // Резолваем товары сделок пользователя из общего списка.
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
    };
};
