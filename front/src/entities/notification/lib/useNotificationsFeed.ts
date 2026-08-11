import {useMemo} from 'react';

import {useGetMyChainsQuery} from '@entities/chain';
import {useGetProductsQuery, useProductsById} from '@entities/product';
import {selectIsAuthenticated, useGetCurrentUserQuery} from '@entities/user';
import {useAppSelector} from '@app/redux';

import {buildNotifications} from './buildNotifications';
import {useGetNotificationReadsQuery} from '../api';
import type {TNotification} from '../types';

/**
 * Общий источник уведомлений для шапки и страницы.
 *
 * SSE обновляет кэш сделок, а этот хук превращает его в ленту событий.
 */
export const useNotificationsFeed = () => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    const {data: currentUser, isLoading: isCurrentUserLoading} = useGetCurrentUserQuery(undefined, {
        skip: !isAuthenticated,
    });
    const {
        data: chains = [],
        isLoading: isChainsLoading,
        isFetching,
        isError,
    } = useGetMyChainsQuery(undefined, {
        skip: !isAuthenticated,
    });
    const {data: products = []} = useGetProductsQuery(undefined, {
        skip: !isAuthenticated,
    });
    const {data: reads = [], isLoading: isReadsLoading, isFetching: isReadsFetching, isError: isReadsError} = useGetNotificationReadsQuery(undefined, {
        skip: !isAuthenticated,
    });

    const currentUserId = currentUser?.customer_id ?? '';

    const productIds = useMemo(
        () => chains.flatMap((chain) => [chain.from_product_id, chain.to_product_id]),
        [chains],
    );
    const productsById = useProductsById(productIds, products);

    const readAtByNotificationId = useMemo(
        () => new Map(reads.map((item) => [`${item.chain_id}:${item.kind}`, item.read_at])),
        [reads],
    );

    const notifications = useMemo<TNotification[]>(
        () => (currentUserId
            ? buildNotifications(chains, productsById, currentUserId)
            : []
        ).map((notification) => ({
            ...notification,
            read_at: readAtByNotificationId.get(notification.id) ?? null,
        })),
        [chains, currentUserId, productsById, readAtByNotificationId],
    );

    /** Непрочитанные события показываются бейджами в навигации. */
    const unreadCount = useMemo(
        () => notifications.filter((item) => item.read_at === null).length,
        [notifications],
    );

    return {
        isAuthenticated,
        notifications,
        unreadCount,
        isLoading: isChainsLoading || isCurrentUserLoading || isReadsLoading,
        isFetching: isFetching || isReadsFetching,
        isError: isError || isReadsError,
    };
};
