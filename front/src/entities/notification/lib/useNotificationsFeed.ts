import {useMemo} from 'react';

import {useGetMyChainsQuery} from '@entities/chain';
import {useGetProductsQuery} from '@entities/product';
import {selectIsAuthenticated, useGetCurrentUserQuery} from '@entities/user';
import {useAppSelector} from '@app/redux';

import {buildNotifications} from './buildNotifications';
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

    const currentUserId = currentUser?.customer_id ?? '';

    const productsById = useMemo(() => {
        const map = new Map<string, import('@entities/product').TProduct>();
        for (const product of products) {
            map.set(product.product_id, product);
        }
        return map;
    }, [products]);

    const notifications = useMemo<TNotification[]>(
        () =>
            currentUserId
                ? buildNotifications(chains, productsById, currentUserId)
                : [],
        [chains, productsById, currentUserId],
    );

    /** Предложения, ожидающие моего ответа — основа бейджа в шапке. */
    const unreadCount = useMemo(
        () =>
            notifications.filter((item) => item.kind === 'incoming_offer').length,
        [notifications],
    );

    return {
        isAuthenticated,
        notifications,
        unreadCount,
        isLoading: isChainsLoading || isCurrentUserLoading,
        isFetching,
        isError,
    };
};
