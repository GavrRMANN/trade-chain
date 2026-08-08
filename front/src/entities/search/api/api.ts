import { createApi } from '@reduxjs/toolkit/query/react';

import { apiBaseQuery } from '@shared/api';
import type { TFindChainRequest, TFindChainResponse } from '../types';

export const searchApi = createApi({
    reducerPath: 'searchApi',
    baseQuery: apiBaseQuery,
    endpoints: (builder) => ({
        findChain: builder.query<TFindChainResponse, TFindChainRequest>({
            query: (params) => ({ url: '/search/chain', params }),
        }),
    }),
});

export const { useFindChainQuery, useLazyFindChainQuery } = searchApi;
