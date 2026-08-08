import { createApi } from '@reduxjs/toolkit/query/react';

import { apiBaseQuery } from '@shared/api';
import type {
    TChain,
    TChainMessage,
    TConfirmChainRequest,
    TCreateChainRequest,
    TSendChainMessageRequest,
    TUpdateChainStatusRequest,
} from '../types';

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
        getMyChains: builder.query<TChain[], void>({ query: () => '/chains/my' }),
        confirmChain: builder.mutation<TChain, { id: string; body: TConfirmChainRequest }>({
            query: ({ id, body }) => ({ url: `/chains/${id}/confirm`, method: 'POST', body }),
        }),
        getChainMessages: builder.query<TChainMessage[], string>({
            query: (id) => `/chains/${id}/messages`,
        }),
        sendChainMessage: builder.mutation<
            TChainMessage,
            { id: string; body: TSendChainMessageRequest }
        >({
            query: ({ id, body }) => ({ url: `/chains/${id}/messages`, method: 'POST', body }),
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
    useGetMyChainsQuery,
    useConfirmChainMutation,
    useGetChainMessagesQuery,
    useSendChainMessageMutation,
} = chainApi;
