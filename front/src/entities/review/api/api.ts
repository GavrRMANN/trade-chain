import { createApi } from '@reduxjs/toolkit/query/react';

import { apiBaseQuery } from '@shared/api';
import type { TCreateReviewRequest, TCustomerRatingResponse, TReview } from '../types';

export const reviewApi = createApi({
    reducerPath: 'reviewApi',
    baseQuery: apiBaseQuery,
    tagTypes: ['Review'],
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
    endpoints: (builder) => ({
        createReview: builder.mutation<TReview, TCreateReviewRequest>({
            query: (body) => ({ url: '/reviews', method: 'POST', body }),
            invalidatesTags: ['Review'],
        }),
        getReview: builder.query<TReview, string>({
            query: (id) => `/reviews/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Review', id }],
        }),
        getReviewsByCustomer: builder.query<TReview[], string>({
            query: (customerId) => `/reviews/by-customer/${customerId}`,
            providesTags: (_result, _error, customerId) => [{ type: 'Review', id: `customer-${customerId}` }],
        }),
        getCustomerRating: builder.query<TCustomerRatingResponse, string>({
            query: (customerId) => `/reviews/by-customer/${customerId}/rating`,
            providesTags: (_result, _error, customerId) => [{ type: 'Review', id: `customer-${customerId}` }],
        }),
        deleteReview: builder.mutation<void, string>({
            query: (id) => ({ url: `/reviews/${id}`, method: 'DELETE' }),
            invalidatesTags: ['Review'],
        }),
    }),
});

export const {
    useCreateReviewMutation,
    useGetReviewQuery,
    useGetReviewsByCustomerQuery,
    useGetCustomerRatingQuery,
    useDeleteReviewMutation,
} = reviewApi;
