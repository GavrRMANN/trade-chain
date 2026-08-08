import { useMemo } from 'react';

import { useGetCustomerQuery } from '@entities/customer';
import { useGetProductQuery, useGetProductsQuery } from '@entities/product';
import { useGetReviewsByCustomerQuery } from '@entities/review';
import { useGetWishlistByProductQuery, useGetWishlistOptionsQuery } from '@entities/wishlist';

export const useProductPageData = (productId?: string) => {
    const productQuery = useGetProductQuery(productId ?? '', { skip: !productId });
    const product = productQuery.data;
    const customerQuery = useGetCustomerQuery(product?.customer_id ?? '', { skip: !product?.customer_id });
    const wishlistQuery = useGetWishlistByProductQuery(productId ?? '', { skip: !productId });
    const optionsQuery = useGetWishlistOptionsQuery(wishlistQuery.data?.wishlist_id ?? '', { skip: !wishlistQuery.data });
    const productsQuery = useGetProductsQuery(undefined, { skip: !wishlistQuery.data });
    const reviewsQuery = useGetReviewsByCustomerQuery(product?.customer_id ?? '', { skip: !product?.customer_id });

    const matchingProducts = useMemo(() => {
        const categoryIds = new Set((optionsQuery.data ?? []).map((item) => item.category_id));
        return (productsQuery.data ?? []).filter((item) => item.product_id !== productId && categoryIds.has(item.category_id ?? ''));
    }, [optionsQuery.data, productId, productsQuery.data]);

    return {
        product,
        customer: customerQuery.data,
        wishlist: wishlistQuery.data,
        wishlistOptions: optionsQuery.data ?? [],
        matchingProducts,
        reviews: reviewsQuery.data ?? [],
        isLoading: productQuery.isLoading,
        isError: productQuery.isError,
    };
};
