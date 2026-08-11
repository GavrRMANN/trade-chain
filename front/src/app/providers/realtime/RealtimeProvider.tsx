import {notification} from 'antd';
import {useEffect, useRef, type PropsWithChildren} from 'react';

import {useNotificationsFeed} from '@entities/notification';

import {useRealtime} from './useRealtime';

export const RealtimeProvider = ({children}: PropsWithChildren) => {
    useRealtime();
    const [api, contextHolder] = notification.useNotification();
    const {isAuthenticated, notifications, isLoading, isFetching} = useNotificationsFeed();
    const initializedRef = useRef(false);
    const previousIdsRef = useRef<Set<string>>(new Set());

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
