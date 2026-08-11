import { createApi } from '@reduxjs/toolkit/query/react';

import { apiBaseQuery } from '@shared/api';
import type {
    TCustomer,
    TCustomerListRequest,
    TCustomerOverview,
    TUpdateCustomerRequest,
} from '../types';

type TUpdateCustomerArgs = {
    customerId: string;
    data: TUpdateCustomerRequest;
};

export const customerApi = createApi({
    reducerPath: 'customerApi',
    baseQuery: apiBaseQuery,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
    endpoints: (builder) => ({
        getCustomers: builder.query<TCustomer[], TCustomerListRequest | void>({
            query: (params) => ({
                url: '/customers',
                ...(params ? { params } : {}),
            }),
        }),
        getCustomersOverview: builder.query<TCustomerOverview[], TCustomerListRequest | void>({
            query: (params) => ({
                url: '/customers/overview',
                ...(params ? { params } : {}),
            }),
        }),
        getCustomer: builder.query<TCustomer, string>({
            query: (customerId) => `/customers/${customerId}`,
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
    useGetCustomersOverviewQuery,
    useGetCustomerQuery,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation,
} = customerApi;
