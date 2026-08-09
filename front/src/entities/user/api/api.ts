import { createApi } from '@reduxjs/toolkit/query/react';
import type {
    TLoginPayload,
    TRegisterPayload,
    TUser,
    TAuthResponse,
} from '../types';
import { apiBaseQuery } from '@/shared/api';

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: apiBaseQuery,
    endpoints: (builder) => ({
        loginUser: builder.mutation<TAuthResponse, TLoginPayload>({
            query: (body) => ({url: '/auth/login', method: 'POST', body}),
        }),
        registerUser: builder.mutation<TAuthResponse, TRegisterPayload>({
            query: (body) => ({url: '/auth/register', method: 'POST', body}),
        }),
        getCurrentUser: builder.query<TUser, void>({
            query: () => '/auth/me',
        }),
    }),
});

export const {
    useLoginUserMutation,
    useRegisterUserMutation,
    useGetCurrentUserQuery,
} = userApi;
