import { createApi } from '@reduxjs/toolkit/query/react';

import { apiBaseQuery } from '@shared/api';
import type { TCategory } from '@entities/category';
import { productApi } from '@entities/product';
import type {
    TCreateWishlistRequest,
    TWishlist,
    TWishlistOptionRequest,
} from '../types';

/**
 * Сбрасывает кэш товаров после правки списка желаний.
 *
 * Отметка «Вам подойдёт» и порядок выдачи считаются на бэкенде из вишлистов,
 * поэтому добавленная категория меняет саму ленту, а не только список желаний.
 * Теги разных API между собой не связаны, и без явного сброса каталог
 * показывал прежние подборки до перезагрузки страницы.
 */
const invalidateProductsAfter = async (
    queryFulfilled: Promise<unknown>,
    dispatch: (action: ReturnType<typeof productApi.util.invalidateTags>) => void,
) => {
    try {
        await queryFulfilled;
        dispatch(productApi.util.invalidateTags(['Product']));
    } catch {
        // Неудачная правка ничего не изменила — сбрасывать нечего.
    }
};

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
            onQueryStarted: (_arg, {dispatch, queryFulfilled}) =>
                invalidateProductsAfter(queryFulfilled, dispatch),
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
            /* Тип `Wishlist` сбрасывается целиком: списки желаний кэшируются по
               товару, а удаление знает только собственный идентификатор. */
            invalidatesTags: (_result, _error, id) => [
                'Wishlist',
                {type: 'WishlistOptions' as const, id},
            ],
            onQueryStarted: (_arg, {dispatch, queryFulfilled}) =>
                invalidateProductsAfter(queryFulfilled, dispatch),
        }),
        getWishlistOptions: builder.query<TCategory[], string>({
            query: (id) => `/wishlists/${id}/options`,
            providesTags: (_result, _error, id) => [{type: 'WishlistOptions', id}],
        }),
        addWishlistOption: builder.mutation<void, { id: string; body: TWishlistOptionRequest }>({
            query: ({ id, body }) => ({ url: `/wishlists/${id}/options`, method: 'POST', body }),
            invalidatesTags: (_result, _error, {id}) => [{type: 'WishlistOptions', id}],
            onQueryStarted: (_arg, {dispatch, queryFulfilled}) =>
                invalidateProductsAfter(queryFulfilled, dispatch),
        }),
        removeWishlistOption: builder.mutation<void, { id: string; categoryId: string }>({
            query: ({ id, categoryId }) => ({
                url: `/wishlists/${id}/options/${categoryId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, {id}) => [{type: 'WishlistOptions', id}],
            onQueryStarted: (_arg, {dispatch, queryFulfilled}) =>
                invalidateProductsAfter(queryFulfilled, dispatch),
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
