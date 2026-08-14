import { notification } from 'antd';
import { useEffect, useRef, type PropsWithChildren } from 'react';

import { useNotificationsFeed } from '@entities/notification';
import type { TSseEvent } from '@shared/api';

import { useRealtime } from './useRealtime';

export const RealtimeProvider = ({ children }: PropsWithChildren) => {
    const [api, contextHolder] = notification.useNotification({ top: 74 });
    const { isAuthenticated, notifications, isLoading, isFetching } = useNotificationsFeed();
    const initializedRef = useRef(false);
    const previousIdsRef = useRef<Set<string>>(new Set());

    useRealtime((event: TSseEvent) => {
        if (
            event.type === 'exchange.message.created' &&
            window.location.pathname !== `/exchanges/${event.chain_id}`
        ) {
            api.open({
                key: `message:${event.chain_id}`,
                message: 'Новое сообщение в чате',
                description: 'Откройте чат, чтобы прочитать сообщение.',
                placement: 'topRight',
            });
        }
    });

    useEffect(() => {
        if (!isAuthenticated) {
            initializedRef.current = false;
            previousIdsRef.current = new Set();
            return;
        }

        if (isLoading || isFetching) return;

        const previousIds = previousIdsRef.current;
        const currentIds = new Set(notifications.map((item) => item.id));

        if (!initializedRef.current) {
            initializedRef.current = true;
        } else {
            notifications
                .filter((item) => !previousIds.has(item.id))
                .forEach((item) => {
                    api.open({
                        key: item.id,
                        message: item.title,
                        description: item.body,
                        placement: 'topRight',
                    });
                });
        }

        previousIdsRef.current = currentIds;
    }, [api, isAuthenticated, isFetching, isLoading, notifications]);

    return (
        <>
            {contextHolder}
            {children}
        </>
    );
};
