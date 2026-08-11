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
    tagTypes: ['Product'],
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
    endpoints: (builder) => ({
        getProducts: builder.query<TProduct[], TProductListRequest | void>({
            query: (params) => ({
                url: '/products',
                ...(params ? { params } : {}),
            }),
            providesTags: (result) => [
                { type: 'Product', id: 'LIST' },
                ...(result ?? []).map(({ product_id }) => ({ type: 'Product' as const, id: product_id })),
            ],
        }),
        getProductsByCustomer: builder.query<TProduct[], string>({
            query: (customerId) => `/products/by-customer/${customerId}`,
            providesTags: (result, _error, customerId) => [
                { type: 'Product', id: `customer-${customerId}` },
                ...(result ?? []).map(({ product_id }) => ({ type: 'Product' as const, id: product_id })),
            ],
        }),
        getMyProducts: builder.query<TProduct[], void>({
            query: () => '/products/mine',
        }),
        getProduct: builder.query<TProduct, string>({
            query: (productId) => `/products/${productId}`,
            providesTags: (_result, _error, productId) => [{ type: 'Product', id: productId }],
        }),
        getProductRecommendations: builder.query<TProductRecommendations, string>({
            query: (productId) => `/products/${productId}/recommendations`,
            providesTags: (_result, _error, productId) => [{ type: 'Product', id: `recommendations-${productId}` }],
        }),
        createProduct: builder.mutation<TProduct, TCreateProductRequest>({
            query: (body) => ({ url: '/products', method: 'POST', body }),
            invalidatesTags: ['Product'],
        }),
        updateProduct: builder.mutation<TProduct, TUpdateProductArgs>({
            query: ({ productId, data }) => ({
                url: `/products/${productId}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (_result, _error, { productId }) => [
                'Product',
                { type: 'Product', id: productId },
                { type: 'Product', id: 'LIST' },
                { type: 'Product', id: `recommendations-${productId}` },
            ],
        }),
        archiveProduct: builder.mutation<void, string>({
            query: (productId) => ({
                url: `/products/${productId}/archive`,
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, productId) => [
                'Product',
                { type: 'Product', id: productId },
                { type: 'Product', id: 'LIST' },
            ],
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
