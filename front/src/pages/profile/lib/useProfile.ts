import {useMemo, useState} from 'react';

import {useGetProductsByCustomerQuery} from '@entities/product';
import type {TProduct} from '@entities/product';
import {useGetCustomerRatingQuery, useGetReviewsByCustomerQuery} from '@entities/review';
import type {TReview} from '@entities/review';
import {useGetMyChainsQuery} from '@entities/chain';
import type {TChain} from '@entities/chain';
import {useGetProductsQuery} from '@entities/product';
import type {TUser} from '@entities/user';
import type {TProfileTab} from '@shared/ui/profileContent';

export type TProfileExchange = {
    chain: TChain;
    fromProduct?: TProduct;
    toProduct?: TProduct;
};

export const useProfile = (user?: TUser) => {
    const [activeTab, setActiveTab] = useState<TProfileTab>('active');
    const customerId = user?.customer_id ?? '';

    const productsQuery = useGetProductsByCustomerQuery(customerId, {skip: !customerId});
    const ratingQuery = useGetCustomerRatingQuery(customerId, {skip: !customerId});
    const reviewsQuery = useGetReviewsByCustomerQuery(customerId, {skip: !customerId});
    const chainsQuery = useGetMyChainsQuery(undefined, {skip: !customerId});
    const allProductsQuery = useGetProductsQuery(undefined, {skip: !customerId});

    const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
    const reviews = useMemo<TReview[]>(() => reviewsQuery.data ?? [], [reviewsQuery.data]);

    const activeProducts = useMemo(
        () => products.filter(({status}) => status !== 'archived'),
        [products],
    );
    const archivedProducts = useMemo(
        () => products.filter(({status}) => status === 'archived'),
        [products],
    );
    const visibleProducts = activeTab === 'active' ? activeProducts : archivedProducts;

    // Резолваем товары сделок пользователя из общего списка.
    const productsById = useMemo(() => {
        const map = new Map<string, TProduct>();
        for (const product of allProductsQuery.data ?? []) {
            map.set(product.product_id, product);
        }
        return map;
    }, [allProductsQuery.data]);

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
        activeProducts,
        archivedProducts,
        visibleProducts,
        reviews,
        exchanges,
        rating: ratingQuery.data?.average_rating ?? 0,
        reviewsCount: reviews.length,
        isLoading: productsQuery.isLoading,
        isError: productsQuery.isError,
    };
};
