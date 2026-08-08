import { createApi } from '@reduxjs/toolkit/query/react';

import { apiBaseQuery } from '@shared/api';
import type {
    TCreateCustomerRequest,
    TCustomer,
    TCustomerListRequest,
    TUpdateCustomerRequest,
} from '../types';

type TUpdateCustomerArgs = {
    customerId: string;
    data: TUpdateCustomerRequest;
};

export const customerApi = createApi({
    reducerPath: 'customerApi',
    baseQuery: apiBaseQuery,
    endpoints: (builder) => ({
        getCustomers: builder.query<TCustomer[], TCustomerListRequest | void>({
            query: (params) => ({
                url: '/customers',
                ...(params ? { params } : {}),
            }),
        }),
        getCustomer: builder.query<TCustomer, string>({
            query: (customerId) => `/customers/${customerId}`,
        }),
        createCustomer: builder.mutation<TCustomer, TCreateCustomerRequest>({
            query: (body) => ({ url: '/customers', method: 'POST', body }),
        }),
        updateCustomer: builder.mutation<TCustomer, TUpdateCustomerArgs>({
            query: ({ customerId, data }) => ({
                url: `/customers/${customerId}`,
                method: 'PATCH',
                body: data,
            }),
        }),
        deleteCustomer: builder.mutation<void, string>({
            query: (customerId) => ({ url: `/customers/${customerId}`, method: 'DELETE' }),
        }),
    }),
});

export const {
    useGetCustomersQuery,
    useGetCustomerQuery,
    useCreateCustomerMutation,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation,
} = customerApi;
