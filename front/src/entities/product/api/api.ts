import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {getApiBaseUrl} from '@shared/api';
import type {
    TCreateProductRequest,
    TProduct,
    TProductListRequest,
    TUpdateProductRequest,
} from '../types';

type TUpdateProductArgs = {
    productId: string;
    data: TUpdateProductRequest;
};

export const productApi = createApi({
    reducerPath: 'productApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${getApiBaseUrl()}/api/v1`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getProducts: builder.query<TProduct[], TProductListRequest | void>({
            query: (params) => ({
                url: '/products',
                ...(params ? {params} : {}),
            }),
        }),
        searchProducts: builder.query<TProduct[], { q: string; category_id?: string }>({
            query: (params) => ({url: '/products/search', params}),
        }),
        getProduct: builder.query<TProduct, string>({
            query: (productId) => `/products/${productId}`,
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
        deleteProduct: builder.mutation<void, string>({
            query: (productId) => ({url: `/products/${productId}`, method: 'DELETE'}),
        }),
        getProductsByCustomer: builder.query<TProduct[], string>({
            query: (customerId) => `/products/by-customer/${customerId}`,
        }),
    }),
});

export const {
    useGetProductsQuery,
    useSearchProductsQuery,
    useGetProductQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useGetProductsByCustomerQuery,
} = productApi;
