import { createApi } from '@reduxjs/toolkit/query/react';

import { apiBaseQuery } from '@shared/api';
import type { TCategory } from '@entities/category';
import type {
    TCreateWishlistRequest,
    TWishlist,
    TWishlistOptionRequest,
} from '../types';

export const wishlistApi = createApi({
    reducerPath: 'wishlistApi',
    baseQuery: apiBaseQuery,
    tagTypes: ['Wishlist', 'WishlistOptions'],
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
    endpoints: (builder) => ({
        createWishlist: builder.mutation<TWishlist, TCreateWishlistRequest>({
            query: (body) => ({ url: '/wishlists', method: 'POST', body }),
            invalidatesTags: (_result, _error, body) => [{type: 'Wishlist', id: body.product_id}],
        }),
        getWishlist: builder.query<TWishlist, string>({
            query: (id) => `/wishlists/${id}`,
            providesTags: (_result, _error, id) => [{type: 'Wishlist', id}],
        }),
        getWishlistByProduct: builder.query<TWishlist, string>({
            query: (productId) => `/wishlists/by-product/${productId}`,
            providesTags: (_result, _error, productId) => [{type: 'Wishlist', id: productId}],
        }),
        deleteWishlist: builder.mutation<void, string>({
            query: (id) => ({ url: `/wishlists/${id}`, method: 'DELETE' }),
        }),
        getWishlistOptions: builder.query<TCategory[], string>({
            query: (id) => `/wishlists/${id}/options`,
            providesTags: (_result, _error, id) => [{type: 'WishlistOptions', id}],
        }),
        addWishlistOption: builder.mutation<void, { id: string; body: TWishlistOptionRequest }>({
            query: ({ id, body }) => ({ url: `/wishlists/${id}/options`, method: 'POST', body }),
            invalidatesTags: (_result, _error, {id}) => [{type: 'WishlistOptions', id}],
        }),
        removeWishlistOption: builder.mutation<void, { id: string; categoryId: string }>({
            query: ({ id, categoryId }) => ({
                url: `/wishlists/${id}/options/${categoryId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, {id}) => [{type: 'WishlistOptions', id}],
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
