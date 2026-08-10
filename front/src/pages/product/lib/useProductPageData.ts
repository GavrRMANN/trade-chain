import {useMemo} from 'react';

import {useGetCategoryQuery} from '@entities/category';
import {useGetChainsByProductQuery, useGetMyChainsQuery} from '@entities/chain';
import {useGetCustomerQuery} from '@entities/customer';
import {
    useGetProductQuery,
    useGetProductRecommendationsQuery,
    useGetProductsByCustomerQuery,
    useGetProductsQuery,
} from '@entities/product';
import {useGetCustomerRatingQuery, useGetReviewsByCustomerQuery} from '@entities/review';
import {selectIsAuthenticated, useGetCurrentUserQuery} from '@entities/user';
import {useGetWishlistByProductQuery, useGetWishlistOptionsQuery} from '@entities/wishlist';
import {useAppSelector} from '@app/redux';

const OPEN_CHAIN_STATUSES = new Set(['pending', 'active', 'countered']);

export const useProductPageData = (productId?: string) => {
    const productQuery = useGetProductQuery(productId ?? '', {skip: !productId});
    const product = productQuery.data;
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const currentUserQuery = useGetCurrentUserQuery(undefined, {skip: !isAuthenticated});
    const currentUserId = currentUserQuery.data?.customer_id;
    const isOwner = Boolean(product && currentUserId && product.customer_id === currentUserId);

    const customerQuery = useGetCustomerQuery(product?.customer_id ?? '', {
        skip: !product?.customer_id,
    });
    const categoryQuery = useGetCategoryQuery(product?.category_id ?? '', {
        skip: !product?.category_id,
    });
    const wishlistQuery = useGetWishlistByProductQuery(productId ?? '', {skip: !productId});
    const optionsQuery = useGetWishlistOptionsQuery(wishlistQuery.data?.wishlist_id ?? '', {
        skip: !wishlistQuery.data,
    });
    const reviewsQuery = useGetReviewsByCustomerQuery(product?.customer_id ?? '', {
        skip: !product?.customer_id,
    });
    const ratingQuery = useGetCustomerRatingQuery(product?.customer_id ?? '', {
        skip: !product?.customer_id,
    });

    const myProductsQuery = useGetProductsByCustomerQuery(currentUserId ?? '', {
        skip: !currentUserId || isOwner,
    });
    const catalogQuery = useGetProductsQuery(undefined, {skip: !isOwner});
    const chainsQuery = useGetChainsByProductQuery(productId ?? '', {
        skip: !productId || !isOwner,
    });
    const recommendationsQuery = useGetProductRecommendationsQuery(
        productId ?? '',
        {skip: !productId || !currentUserId || isOwner},
    );
    const myChainsQuery = useGetMyChainsQuery(undefined, {
        skip: !currentUserId || isOwner,
    });

    const matchingProducts = useMemo(() => {
        const categoryIds = new Set((optionsQuery.data ?? []).map((item) => item.category_id));
        return (myProductsQuery.data ?? []).filter(
            (item) => item.status === 'active' && categoryIds.has(item.category_id ?? ''),
        );
    }, [myProductsQuery.data, optionsQuery.data]);

    const routeChain = useMemo(() => {
        const products = recommendationsQuery.data?.Products ?? [];
        return [...products].reverse();
    }, [recommendationsQuery.data?.Products]);

    const productOffers = useMemo(() => {
        const productsById = new Map(
            (catalogQuery.data ?? []).map((item) => [item.product_id, item]),
        );
        if (product) productsById.set(product.product_id, product);

        return (chainsQuery.data ?? [])
            .filter(
                (chain) =>
                    chain.to_product_id === productId && chain.initiator_id !== currentUserId,
            )
            .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
            .map((chain) => ({
                chain,
                fromProduct: productsById.get(chain.from_product_id),
                toProduct: product,
            }));
    }, [catalogQuery.data, chainsQuery.data, currentUserId, product, productId]);

    const incomingOffers = productOffers.filter((row) =>
        OPEN_CHAIN_STATUSES.has(row.chain.status),
    ).length;

    const targetChain = useMemo(
        () =>
            [...(myChainsQuery.data ?? [])]
                .filter(
                    (chain) =>
                        chain.exchange_goal_id === productId ||
                        (!chain.exchange_goal_id && chain.to_product_id === productId),
                )
                .sort((left, right) => Date.parse(right.updated_at) - Date.parse(left.updated_at))[0],
        [myChainsQuery.data, productId],
    );

    return {
        product,
        customer: customerQuery.data,
        category: categoryQuery.data,
        wishlist: wishlistQuery.data,
        wishlistOptions: optionsQuery.data ?? [],
        matchingProducts,
        routeChain,
        reviews: reviewsQuery.data ?? [],
        averageRating: ratingQuery.data?.average_rating,
        incomingOffers,
        productOffers,
        targetChain,
        isOwner,
        isAuthenticated,
        currentUserId,
        isLoading: productQuery.isLoading || (isAuthenticated && currentUserQuery.isLoading),
        isError: productQuery.isError,
    };
};
