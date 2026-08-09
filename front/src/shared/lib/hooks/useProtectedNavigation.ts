import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { getAuthToken } from '@shared/api';
import { useOpenModalRoute } from '@shared/lib';

/**
 * Возвращает колбэк для навигации по маршрутам, требующим авторизации.
 * Если пользователь не авторизован — открывает модальное окно авторизации.
 */
export const useProtectedNavigation = () => {
    const navigate = useNavigate();
    const openModal = useOpenModalRoute();

    return useCallback(
        (path: string) => {
            if (getAuthToken()) {
                navigate(path);
                return;
            }
            openModal('auth');
        },
        [navigate, openModal],
    );
};
