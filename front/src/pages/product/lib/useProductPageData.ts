import { useMemo } from 'react';

import { useGetCustomerQuery } from '@entities/customer';
import { useGetProductQuery, useGetProductsQuery } from '@entities/product';
import { useGetReviewsByCustomerQuery } from '@entities/review';
import { useGetWishlistByProductQuery, useGetWishlistOptionsQuery } from '@entities/wishlist';
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

    const matchingProducts = useMemo(() => {
        const categoryIds = new Set((optionsQuery.data ?? []).map((item) => item.category_id));
        return (productsQuery.data ?? []).filter((item) => item.product_id !== productId && categoryIds.has(item.category_id ?? ''));
    }, [optionsQuery.data, productId, productsQuery.data]);

    const isOwner = Boolean(
        product && currentUserQuery.data && product.customer_id === currentUserQuery.data.customer_id,
    );

    return {
        product,
        customer: customerQuery.data,
        wishlist: wishlistQuery.data,
        wishlistOptions: optionsQuery.data ?? [],
        matchingProducts,
        reviews: reviewsQuery.data ?? [],
        isOwner,
        isLoading: productQuery.isLoading,
        isError: productQuery.isError,
    };
};
