import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { selectIsAuthenticated } from '@entities/user';
import { useAppSelector } from '@app/redux';
import { getBackgroundRoute } from '@features/auth';

export const useAuthModal = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    const closeModal = useCallback(() => {
        const backgroundRoute = getBackgroundRoute(location);
        navigate(backgroundRoute, { replace: true });
    }, [location, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            closeModal();
        }
    }, [closeModal, isAuthenticated]);

    return {
        isAuthenticated,
        closeModal,
    };
};
