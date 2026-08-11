import { createApi } from '@reduxjs/toolkit/query/react';
import { apiBaseQuery } from '@shared/api';
import type {
    TCreateProductRequest,
    TProduct,
    TProductListRequest,
    TProductRecommendations,
    TUpdateProductRequest,
} from '../types';

type TUpdateProductArgs = {
    productId: string;
    data: TUpdateProductRequest;
};

export const productApi = createApi({
    reducerPath: 'productApi',
    baseQuery: apiBaseQuery,
    endpoints: (builder) => ({
        getProducts: builder.query<TProduct[], TProductListRequest | void>({
            query: (params) => ({
                url: '/products',
                ...(params ? { params } : {}),
            }),
        }),
        getProductsByCustomer: builder.query<TProduct[], string>({
            query: (customerId) => `/products/by-customer/${customerId}`,
        }),
        getMyProducts: builder.query<TProduct[], void>({
            query: () => '/products/mine',
        }),
        getProduct: builder.query<TProduct, string>({
            query: (productId) => `/products/${productId}`,
        }),
        getProductRecommendations: builder.query<TProductRecommendations, string>({
            query: (productId) => `/products/${productId}/recommendations`,
        }),
        createProduct: builder.mutation<TProduct, TCreateProductRequest>({
            query: (body) => ({ url: '/products', method: 'POST', body }),
        }),
        updateProduct: builder.mutation<TProduct, TUpdateProductArgs>({
            query: ({ productId, data }) => ({
                url: `/products/${productId}`,
                method: 'PATCH',
                body: data,
            }),
        }),
        archiveProduct: builder.mutation<void, string>({
            query: (productId) => ({
                url: `/products/${productId}/archive`,
                method: 'POST',
            }),
        }),
    }),
});

export const {
    useGetProductsQuery,
    useGetProductsByCustomerQuery,
    useGetMyProductsQuery,
    useLazyGetProductsQuery,
    useGetProductQuery,
    useGetProductRecommendationsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useArchiveProductMutation,
} = productApi;
