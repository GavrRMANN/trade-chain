import { useMemo } from 'react';

import { useGetCustomerQuery } from '@entities/customer';
import { useGetProductQuery, useGetProductsQuery, useGetRecommendationsQuery } from '@entities/product';
import { useGetReviewsByCustomerQuery, useGetCustomerRatingQuery } from '@entities/review';
import { useGetWishlistByProductQuery, useGetWishlistOptionsQuery } from '@entities/wishlist';
import { useGetChainsByProductQuery } from '@entities/chain';
import { useGetCurrentUserQuery } from '@entities/user';
import { getAuthToken } from '@shared/api';

export const useProductPageData = (productId?: string) => {
    const productQuery = useGetProductQuery(productId ?? '', { skip: !productId });
    const product = productQuery.data;
    const isAuthenticated = Boolean(getAuthToken());
    const currentUserQuery = useGetCurrentUserQuery(undefined, { skip: !isAuthenticated });
    const customerQuery = useGetCustomerQuery(product?.customer_id ?? '', { skip: !product?.customer_id });
    const wishlistQuery = useGetWishlistByProductQuery(productId ?? '', { skip: !productId });
    const optionsQuery = useGetWishlistOptionsQuery(wishlistQuery.data?.wishlist_id ?? '', { skip: !wishlistQuery.data });
    const productsQuery = useGetProductsQuery(undefined, { skip: !wishlistQuery.data });
    const reviewsQuery = useGetReviewsByCustomerQuery(product?.customer_id ?? '', { skip: !product?.customer_id });
    const ratingQuery = useGetCustomerRatingQuery(product?.customer_id ?? '', { skip: !product?.customer_id });
    const chainsQuery = useGetChainsByProductQuery(productId ?? '', { skip: !productId });

    // Маршрут обмена до этого товара строится только для не-владельца:
    // владельцу незачем получать путь к собственному товару.
    const currentUserId = currentUserQuery.data?.customer_id;
    const isOwner = Boolean(
        product && currentUserQuery.data && product.customer_id === currentUserQuery.data.customer_id,
    );
    const canFindChain = Boolean(productId) && !isOwner;
    const recommendationsQuery = useGetRecommendationsQuery(productId ?? '', { skip: !canFindChain });

    const matchingProducts = useMemo(() => {
        const categoryIds = new Set((optionsQuery.data ?? []).map((item) => item.category_id));
        return (productsQuery.data ?? []).filter((item) => item.product_id !== productId && categoryIds.has(item.category_id ?? ''));
    }, [optionsQuery.data, productId, productsQuery.data]);

    // Бекенд отдаёт цепочку сверху вниз: желанный товар вверху, наш — внизу.
    // Для отрисовки приводим к порядку «от нашего (первый) к желанному (последний)».
    const routeChain = useMemo(() => {
        const products = recommendationsQuery.data?.Products ?? [];
        return [...products].reverse();
    }, [recommendationsQuery.data?.Products]);

    // Входящие предложения обмена (цепочки) по этому товару.
    const incomingOffers = (chainsQuery.data ?? []).length;

    return {
        product,
        customer: customerQuery.data,
        wishlist: wishlistQuery.data,
        wishlistOptions: optionsQuery.data ?? [],
        matchingProducts,
        routeChain,
        reviews: reviewsQuery.data ?? [],
        averageRating: ratingQuery.data?.average_rating,
        incomingOffers,
        isOwner,
        currentUserId,
        isLoading: productQuery.isLoading,
        isError: productQuery.isError,
    };
};
