import { createApi } from '@reduxjs/toolkit/query/react';

import { apiBaseQuery } from '@shared/api';
import type { TCreateReviewRequest, TCustomerRatingResponse, TReview } from '../types';

export const reviewApi = createApi({
    reducerPath: 'reviewApi',
    baseQuery: apiBaseQuery,
    endpoints: (builder) => ({
        createReview: builder.mutation<TReview, TCreateReviewRequest>({
            query: (body) => ({ url: '/reviews', method: 'POST', body }),
        }),
        getReview: builder.query<TReview, string>({ query: (id) => `/reviews/${id}` }),
        getReviewsByCustomer: builder.query<TReview[], string>({
            query: (customerId) => `/reviews/by-customer/${customerId}`,
        }),
        getCustomerRating: builder.query<TCustomerRatingResponse, string>({
            query: (customerId) => `/reviews/by-customer/${customerId}/rating`,
        }),
        deleteReview: builder.mutation<void, string>({
            query: (id) => ({ url: `/reviews/${id}`, method: 'DELETE' }),
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
