import { createApi } from '@reduxjs/toolkit/query/react';
import type {
    TDemoLoginPayload,
    TLoginPayload,
    TRegisterPayload,
    TUser,
    TAuthResponse,
} from '../types';
import { apiBaseQuery } from '@/shared/api';

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: apiBaseQuery,
    tagTypes: ['CurrentUser'],
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
    endpoints: (builder) => ({
        loginUser: builder.mutation<TAuthResponse, TLoginPayload>({
            query: (body) => ({url: '/auth/login', method: 'POST', body}),
            invalidatesTags: ['CurrentUser'],
        }),
        registerUser: builder.mutation<TAuthResponse, TRegisterPayload>({
            query: (body) => ({url: '/auth/register', method: 'POST', body}),
            invalidatesTags: ['CurrentUser'],
        }),
        demoLoginUser: builder.mutation<TAuthResponse, TDemoLoginPayload>({
            query: (body) => ({url: '/auth/demo-login', method: 'POST', body}),
            invalidatesTags: ['CurrentUser'],
        }),
        getCurrentUser: builder.query<TUser, void>({
            query: () => '/auth/me',
            providesTags: ['CurrentUser'],
        }),
    }),
});

export const {
    useLoginUserMutation,
    useRegisterUserMutation,
    useDemoLoginUserMutation,
    useGetCurrentUserQuery,
} = userApi;
