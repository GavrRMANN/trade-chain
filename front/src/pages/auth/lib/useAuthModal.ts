import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getAuthToken } from '@shared/api';
import { getBackgroundRoute } from '@shared/lib';

export const useAuthModal = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isAuthenticated = Boolean(getAuthToken());

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
