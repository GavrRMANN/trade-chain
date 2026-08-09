import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { selectIsAuthenticated } from '@entities/user';
import { useAppSelector } from '@app/redux';
import { useOpenModalRoute } from '@shared/lib';

/**
 * Возвращает колбэк для навигации по маршрутам, требующим авторизации.
 * Если пользователь не авторизован — открывает модальное окно авторизации.
 */
export const useProtectedNavigation = () => {
    const navigate = useNavigate();
    const openModal = useOpenModalRoute();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    return useCallback(
        (path: string) => {
            if (isAuthenticated) {
                navigate(path);
                return;
            }
            openModal('auth');
        },
        [navigate, openModal, isAuthenticated],
    );
};
