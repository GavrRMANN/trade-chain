import {useLayoutEffect} from 'react';
import {useNavigate} from 'react-router-dom';

import {useNotificationsFeed} from '@entities/notification';
import {usePageTitle} from '@app/providers/pageTitle';
import {useOpenModalRoute} from '@shared/lib';

/**
 * Управляет данными и навигацией страницы «Уведомления».
 * Содержимое ленты поставляет общий хук useNotificationsFeed.
 */
export const useNotificationsPage = () => {
    const {setTitle} = usePageTitle();
    const navigate = useNavigate();
    const openModal = useOpenModalRoute();

    const {
        isAuthenticated,
        notifications,
        unreadCount,
        isLoading,
        isError,
    } = useNotificationsFeed();

    useLayoutEffect(() => {
        setTitle('Уведомления');
    }, [setTitle]);

    const openExchange = (chainId: string) => {
        navigate(`/exchanges/${chainId}`);
    };

    const openCatalog = () => {
        navigate('/');
    };

    return {
        isAuthenticated,
        notifications,
        unreadCount,
        isLoading,
        isError,
        openExchange,
        openCatalog,
        openAuthModal: () => openModal('auth'),
    };
};
