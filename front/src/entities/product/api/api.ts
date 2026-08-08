import {createApi} from '@reduxjs/toolkit/query/react';
import {apiBaseQuery} from '@shared/api';
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
    baseQuery: apiBaseQuery,
    endpoints: (builder) => ({
        getProducts: builder.query<TProduct[], TProductListRequest | void>({
            query: (params) => ({
                url: '/products',
                ...(params ? {params} : {}),
            }),
        }),
        getProductsByCustomer: builder.query<TProduct[], string>({
            query: (customerId) => `/products/by-customer/${customerId}`,
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
    }),
});

export const {
    useGetProductsQuery,
    useGetProductsByCustomerQuery,
    useLazyGetProductsQuery,
    useGetProductQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
} = productApi;
