import { useCallback } from 'react';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AuthForm } from '@features/auth';
import { getAuthToken } from '@shared/api';
import { Modal } from '@shared/ui/modal';

import Styles from './auth-modal.module.css';
import { getBackgroundRoute } from '@shared/lib';

export const AuthModal = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isAuthenticated = Boolean(getAuthToken());

    const getBackgroundRouteCallback = useCallback(() => {
        return getBackgroundRoute(location);
    }, [location.state]);

    const closeModal = useCallback(() => {
        navigate(getBackgroundRouteCallback(), { replace: true });
    }, [getBackgroundRoute, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            closeModal();
        }
    }, [closeModal, isAuthenticated]);

    if (isAuthenticated) {
        return null;
    }

    return (
        <Modal title="Вход и регистрация" isOpen onClose={closeModal}>
            <div className={Styles.content}>
                <p className={Styles.description}>
                    Войдите, чтобы покупать, продавать и находить нужные товары.
                </p>
                <AuthForm />
            </div>
        </Modal>
    );
};
