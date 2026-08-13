import {useNavigate} from 'react-router-dom';

import {useMarkAllNotificationsAsReadMutation, useMarkNotificationAsReadMutation} from '@entities/notification/api';
import {useNotificationsFeed} from '@entities/notification/lib';
import type {TNotification} from '@entities/notification/types';

/**
 * Управляет данными и навигацией страницы «Уведомления».
 * Содержимое ленты поставляет общий хук useNotificationsFeed.
 */
export const useNotificationsPage = () => {
    const navigate = useNavigate();

    const {
        notifications,
        unreadCount,
        isLoading,
        isError,
    } = useNotificationsFeed();
    const [markAllNotificationsAsRead, {isLoading: isMarkingAllAsRead}] = useMarkAllNotificationsAsReadMutation();
    const [markNotificationAsRead] = useMarkNotificationAsReadMutation();

    const openExchange = async (notification: TNotification) => {
        if (notification.read_at === null) {
            await markNotificationAsRead({
                chainId: notification.chain_id,
                kind: notification.kind,
            }).unwrap();
        }
        navigate(`/exchanges/${notification.chain_id}`);
    };

    const markAllAsRead = () => {
        void markAllNotificationsAsRead();
    };

    const openCatalog = () => {
        navigate('/');
    };

    return {
        notifications,
        unreadCount,
        isLoading,
        isError,
        openExchange,
        openCatalog,
        markAllAsRead,
        isMarkingAllAsRead,
    };
};
