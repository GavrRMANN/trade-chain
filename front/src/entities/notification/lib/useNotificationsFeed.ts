import {useMemo} from 'react';

import {useGetMyChainsQuery} from '@entities/chain';
import {useGetProductsQuery} from '@entities/product';
import {selectIsAuthenticated, useGetCurrentUserQuery} from '@entities/user';
import {useAppSelector} from '@app/redux';

import {buildNotifications} from './buildNotifications';
import type {TNotification} from '../types';

const POLLING_INTERVAL = 30_000;

type TFeedOptions = {
    /** Включить периодический опрос. Выключают на страницах с собственным refetch. */
    polling?: boolean;
};

/**
 * Общий источник уведомлений для шапки и страницы.
 *
 * Опрашивает «Мои обмены» раз в 30 секунд (бэкенд уведомлений/WebSocket
 * отсутствует — см. docs/PRODUCT_FLOW.md §4) и превращает сделки в ленту событий.
 */
export const useNotificationsFeed = (options: TFeedOptions = {}) => {
    const {polling = true} = options;
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    const {data: currentUser} = useGetCurrentUserQuery(undefined, {
        skip: !isAuthenticated,
    });
    const {
        data: chains = [],
        isLoading,
        isFetching,
        isError,
    } = useGetMyChainsQuery(undefined, {
        skip: !isAuthenticated,
        pollingInterval: polling ? POLLING_INTERVAL : undefined,
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
        isLoading,
        isFetching,
        isError,
    };
};
