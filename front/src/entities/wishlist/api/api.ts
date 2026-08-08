import { createApi } from '@reduxjs/toolkit/query/react';

import { apiBaseQuery } from '@shared/api';
import type { Category } from '@entities/category';
import type {
    TCreateWishlistRequest,
    TWishlist,
    TWishlistOptionRequest,
} from '../types';

export const wishlistApi = createApi({
    reducerPath: 'wishlistApi',
    baseQuery: apiBaseQuery,
    endpoints: (builder) => ({
        createWishlist: builder.mutation<TWishlist, TCreateWishlistRequest>({
            query: (body) => ({ url: '/wishlists', method: 'POST', body }),
        }),
        getWishlist: builder.query<TWishlist, string>({ query: (id) => `/wishlists/${id}` }),
        getWishlistByProduct: builder.query<TWishlist, string>({
            query: (productId) => `/wishlists/by-product/${productId}`,
        }),
        deleteWishlist: builder.mutation<void, string>({
            query: (id) => ({ url: `/wishlists/${id}`, method: 'DELETE' }),
        }),
        getWishlistOptions: builder.query<Category[], string>({
            query: (id) => `/wishlists/${id}/options`,
        }),
        addWishlistOption: builder.mutation<void, { id: string; body: TWishlistOptionRequest }>({
            query: ({ id, body }) => ({ url: `/wishlists/${id}/options`, method: 'POST', body }),
        }),
        removeWishlistOption: builder.mutation<void, { id: string; categoryId: string }>({
            query: ({ id, categoryId }) => ({
                url: `/wishlists/${id}/options/${categoryId}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    useCreateWishlistMutation,
    useGetWishlistQuery,
    useGetWishlistByProductQuery,
    useDeleteWishlistMutation,
    useGetWishlistOptionsQuery,
    useAddWishlistOptionMutation,
    useRemoveWishlistOptionMutation,
} = wishlistApi;
