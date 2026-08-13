import { createApi } from '@reduxjs/toolkit/query/react';

import { apiBaseQuery } from '@shared/api';
import type {
    TCustomer,
    TCustomerListRequest,
    TCustomerOverview,
    TCustomerRecommendation,
    TUpdateCustomerRecommendationsRequest,
    TUpdateCustomerRequest,
} from '../types';

type TUpdateCustomerArgs = {
    customerId: string;
    data: TUpdateCustomerRequest;
};

/** Идентификатор кэша для вишлиста самого залогиненного пользователя. */
const MY_RECOMMENDATIONS_TAG_ID = 'ME';

export const customerApi = createApi({
    reducerPath: 'customerApi',
    baseQuery: apiBaseQuery,
    tagTypes: ['CustomerRecommendations'],
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
        getCustomerRecommendations: builder.query<TCustomerRecommendation[], string>({
            query: (customerId) => `/customers/${customerId}/recommendations`,
            providesTags: (_result, _error, customerId) => [
                { type: 'CustomerRecommendations', id: customerId },
            ],
        }),
        getMyRecommendations: builder.query<TCustomerRecommendation[], void>({
            query: () => '/customers/me/recommendations',
            providesTags: [{ type: 'CustomerRecommendations', id: MY_RECOMMENDATIONS_TAG_ID }],
        }),
        addMyRecommendations: builder.mutation<TCustomerRecommendation[], TUpdateCustomerRecommendationsRequest>({
            query: (body) => ({ url: '/customers/me/recommendations', method: 'POST', body }),
            invalidatesTags: [{ type: 'CustomerRecommendations', id: MY_RECOMMENDATIONS_TAG_ID }],
        }),
        replaceMyRecommendations: builder.mutation<TCustomerRecommendation[], TUpdateCustomerRecommendationsRequest>({
            query: (body) => ({ url: '/customers/me/recommendations', method: 'PATCH', body }),
            invalidatesTags: [{ type: 'CustomerRecommendations', id: MY_RECOMMENDATIONS_TAG_ID }],
        }),
        deleteMyRecommendation: builder.mutation<void, string>({
            query: (categoryId) => ({
                url: `/customers/me/recommendations/${categoryId}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'CustomerRecommendations', id: MY_RECOMMENDATIONS_TAG_ID }],
        }),
    }),
});

export const {
    useGetCustomersQuery,
    useGetCustomersOverviewQuery,
    useGetCustomerQuery,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation,
    useGetCustomerRecommendationsQuery,
    useGetMyRecommendationsQuery,
    useAddMyRecommendationsMutation,
    useReplaceMyRecommendationsMutation,
    useDeleteMyRecommendationMutation,
} = customerApi;
