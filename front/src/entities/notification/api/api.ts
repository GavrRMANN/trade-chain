import {createApi} from '@reduxjs/toolkit/query/react';

import {apiBaseQuery} from '@shared/api';

import type {TNotificationKind, TNotificationRead} from '../types';

export const notificationApi = createApi({
    reducerPath: 'notificationApi',
    baseQuery: apiBaseQuery,
    tagTypes: ['Notification'],
    endpoints: (builder) => ({
        getNotificationReads: builder.query<TNotificationRead[], void>({
            query: () => '/notifications/read-statuses',
            providesTags: ['Notification'],
        }),
        markNotificationAsRead: builder.mutation<void, {chainId: string; kind: TNotificationKind}>({
            query: ({chainId, kind}) => ({
                url: `/notifications/${chainId}/read`,
                method: 'PUT',
                body: {kind},
            }),
            invalidatesTags: ['Notification'],
        }),
        markAllNotificationsAsRead: builder.mutation<void, void>({
            query: () => ({url: '/notifications/read-all', method: 'PUT'}),
            invalidatesTags: ['Notification'],
        }),
    }),
});

export const {
    useGetNotificationReadsQuery,
    useMarkNotificationAsReadMutation,
    useMarkAllNotificationsAsReadMutation,
} = notificationApi;
