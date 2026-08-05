import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
    TLoginPayload,
    TRegisterPayload,
    TUser,
    TUserProfile,
} from '../types';
import { getApiBaseUrl } from '@/shared/api';

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({ baseUrl: getApiBaseUrl() }),
    tagTypes: ['TUser'],
    endpoints: (builder) => ({
        getUsers: builder.query<TUser[], void>({
            query: () => ({
                url: '/users',
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: 'TUser' as const, id })),
                          { type: 'TUser', id: 'LIST' },
                      ]
                    : [{ type: 'TUser', id: 'LIST' }],
        }),
        getUserById: builder.query<TUserProfile, string>({
            query: (userId: string) => ({
                url: `/users/${userId}`,
            }),
            providesTags: (_result, _error, userId) => [{ type: 'TUser', id: userId }],
        }),
        loginUser: builder.mutation<TUser | undefined, TLoginPayload>({
            query: (loginData: TLoginPayload) => ({
                url: '/users',
                params: loginData,
            }),
            transformResponse: (users: TUser[]) => users[0],
        }),
        registerUser: builder.mutation<TUser, TRegisterPayload>({
            query: (newUser: TRegisterPayload) => ({
                url: '/users',
                method: 'POST',
                body: {
                    id: crypto.randomUUID(),
                    ...newUser,
                    createdAt: new Date().toISOString(),
                },
            }),
            invalidatesTags: [{ type: 'TUser', id: 'LIST' }],
        }),
        deleteUser: builder.mutation<void, string>({
            query: (userId: string) => ({
                url: `/users/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, userId) => [
                { type: 'TUser', id: userId },
                { type: 'TUser', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetUsersQuery,
    useGetUserByIdQuery,
    useLoginUserMutation,
    useRegisterUserMutation,
    useDeleteUserMutation,
} = userApi;
