import { createApi } from '@reduxjs/toolkit/query/react';

import { apiBaseQuery } from '@shared/api';
import type {
    TFindCandidatesRequest,
    TFindCandidatesResponse,
    TFindChainRequest,
    TFindChainResponse,
} from '../types';

export const searchApi = createApi({
    reducerPath: 'searchApi',
    baseQuery: apiBaseQuery,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
    endpoints: (builder) => ({
        findChain: builder.query<TFindChainResponse, TFindChainRequest>({
            query: (params) => ({ url: '/search/chain', params }),
        }),
        findCandidates: builder.query<TFindCandidatesResponse, TFindCandidatesRequest>({
            query: (params) => ({ url: '/search/candidates', params }),
        }),
    }),
});

export const { useFindChainQuery, useLazyFindChainQuery, useFindCandidatesQuery } = searchApi;
