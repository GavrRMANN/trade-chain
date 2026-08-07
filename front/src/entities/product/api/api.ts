import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {getApiBaseUrl} from '@shared/api';
import type {
    TCreateProductRequest,
    TProduct,
    TProductListRequest,
    TProductWishlistRequest,
    TProductsResponse,
    TUpdateProductRequest,
} from '../types';

type TUpdateProductArgs = {
    productId: string;
    data: TUpdateProductRequest;
};

type TProductWishlistArgs = {
    productId: string;
    data: TProductWishlistRequest;
};

export const productApi = createApi({
    reducerPath: 'productApi',
    baseQuery: fetchBaseQuery({baseUrl: `${getApiBaseUrl()}/api/v1`}),
    endpoints: (builder) => ({
        getProducts: builder.query<TProductsResponse, TProductListRequest>({
            query: (params) => ({url: '/products', params}),
        }),
        getProduct: builder.query<TProduct, string>({
            query: (productId) => `/products/${productId}`,
        }),
        getProductRecommendations: builder.query<TProduct[], string>({
            query: (productId) => `/products/${productId}/recommendations`,
        }),
        createProduct: builder.mutation<TProduct, TCreateProductRequest>({
            query: (body) => ({url: '/products', method: 'POST', body}),
        }),
        updateProduct: builder.mutation<TProduct, TUpdateProductArgs>({
            query: ({productId, data}) => ({
                url: `/products/${productId}`,
                method: 'PATCH',
                body: data,
            }),
        }),
        archiveProduct: builder.mutation<TProduct, string>({
            query: (productId) => ({url: `/products/${productId}/archive`, method: 'POST'}),
        }),
        updateProductWishlist: builder.mutation<TProduct, TProductWishlistArgs>({
            query: ({productId, data}) => ({
                url: `/products/${productId}/wishlist`,
                method: 'PUT',
                body: data,
            }),
        }),
    }),
});

export const {
    useGetProductsQuery,
    useGetProductQuery,
    useGetProductRecommendationsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useArchiveProductMutation,
    useUpdateProductWishlistMutation,
} = productApi;
