import { createApi } from '@reduxjs/toolkit/query/react';

import { apiBaseQuery } from '@shared/api';
import type { TChain, TCreateChainRequest, TUpdateChainStatusRequest } from '../types';

export const chainApi = createApi({
    reducerPath: 'chainApi',
    baseQuery: apiBaseQuery,
    endpoints: (builder) => ({
        createChain: builder.mutation<TChain, TCreateChainRequest>({
            query: (body) => ({ url: '/chains', method: 'POST', body }),
        }),
        getChain: builder.query<TChain, string>({ query: (id) => `/chains/${id}` }),
        getFullChain: builder.query<TChain[], string>({ query: (id) => `/chains/${id}/full` }),
        getChainsByProduct: builder.query<TChain[], string>({
            query: (productId) => `/chains/by-product/${productId}`,
        }),
        updateChainStatus: builder.mutation<void, { id: string; body: TUpdateChainStatusRequest }>({
            query: ({ id, body }) => ({ url: `/chains/${id}/status`, method: 'PATCH', body }),
        }),
        deleteChain: builder.mutation<void, string>({
            query: (id) => ({ url: `/chains/${id}`, method: 'DELETE' }),
        }),
    }),
});

export const {
    useCreateChainMutation,
    useGetChainQuery,
    useGetFullChainQuery,
    useGetChainsByProductQuery,
    useUpdateChainStatusMutation,
    useDeleteChainMutation,
} = chainApi;
