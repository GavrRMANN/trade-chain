import { createApi } from '@reduxjs/toolkit/query/react';

import { apiBaseQuery } from '@shared/api';
import type {
    TChain,
    TChainDetails,
    TChainMessage,
    TConfirmChainRequest,
    TCreateChainRequest,
    TSendChainMessageRequest,
    TUpdateChainStatusRequest,
} from '../types';

export const chainApi = createApi({
    reducerPath: 'chainApi',
    baseQuery: apiBaseQuery,
    tagTypes: ['Chain', 'ChainDetails', 'ChainMessages'],
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
    endpoints: (builder) => ({
        createChain: builder.mutation<TChain, TCreateChainRequest>({
            query: (body) => ({ url: '/chains', method: 'POST', body }),
            invalidatesTags: ['Chain'],
        }),
        getChain: builder.query<TChain, string>({
            query: (id) => `/chains/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Chain', id }],
        }),
        getChainDetails: builder.query<TChainDetails, string>({
            query: (id) => `/exchange-offers/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'ChainDetails', id }],
        }),
        getFullChain: builder.query<TChain[], string>({
            query: (id) => `/chains/${id}/full`,
            providesTags: (_result, _error, id) => [{ type: 'Chain', id }],
        }),
        getChainsByProduct: builder.query<TChain[], string>({
            query: (productId) => `/chains/by-product/${productId}`,
            providesTags: (_result, _error, productId) => [{ type: 'Chain', id: `product-${productId}` }],
        }),
        updateChainStatus: builder.mutation<void, { id: string; body: TUpdateChainStatusRequest }>({
            query: ({ id, body }) => ({ url: `/chains/${id}/status`, method: 'PATCH', body }),
            invalidatesTags: (_result, _error, { id }) => [
                'Chain',
                { type: 'Chain', id },
                { type: 'Chain', id: 'LIST' },
                { type: 'ChainDetails', id },
            ],
        }),
        deleteChain: builder.mutation<void, string>({
            query: (id) => ({ url: `/chains/${id}`, method: 'DELETE' }),
            invalidatesTags: (_result, _error, id) => [
                'Chain',
                { type: 'Chain', id },
                { type: 'Chain', id: 'LIST' },
            ],
        }),
        getMyChains: builder.query<TChain[], void>({
            query: () => '/chains/my',
            providesTags: (result) => [
                { type: 'Chain', id: 'LIST' },
                ...(result ?? []).map(({ chain_id }) => ({ type: 'Chain' as const, id: chain_id })),
            ],
        }),
        confirmChain: builder.mutation<TChain, { id: string; body: TConfirmChainRequest }>({
            query: ({ id, body }) => ({ url: `/chains/${id}/confirm`, method: 'POST', body }),
            invalidatesTags: (_result, _error, { id }) => [
                'Chain',
                { type: 'Chain', id },
                { type: 'Chain', id: 'LIST' },
                { type: 'ChainDetails', id },
            ],
        }),
        getChainMessages: builder.query<TChainMessage[], string>({
            query: (id) => `/chains/${id}/messages`,
            providesTags: (_result, _error, id) => [{ type: 'ChainMessages', id }],
        }),
        sendChainMessage: builder.mutation<
            TChainMessage,
            { id: string; body: TSendChainMessageRequest }
        >({
            query: ({ id, body }) => ({ url: `/chains/${id}/messages`, method: 'POST', body }),
            invalidatesTags: (_result, _error, { id }) => [
                'Chain',
                { type: 'ChainMessages', id },
                { type: 'Chain', id },
                { type: 'Chain', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useCreateChainMutation,
    useGetChainQuery,
    useGetChainDetailsQuery,
    useGetFullChainQuery,
    useGetChainsByProductQuery,
    useUpdateChainStatusMutation,
    useDeleteChainMutation,
    useGetMyChainsQuery,
    useConfirmChainMutation,
    useGetChainMessagesQuery,
    useSendChainMessageMutation,
} = chainApi;
