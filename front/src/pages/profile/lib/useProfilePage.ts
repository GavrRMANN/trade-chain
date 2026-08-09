import { useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useGetCurrentUserQuery, logout } from '@entities/user';
import { useGetCustomerQuery } from '@entities/customer';
import { getAuthToken } from '@shared/api';
import { useOpenModalRoute } from '@shared/lib';
import { usePageTitle } from '@app/providers/pageTitle';
import { useAppDispatch } from '@app/redux';

export const useProfilePage = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const openModal = useOpenModalRoute();
    const { setTitle } = usePageTitle();
    const dispatch = useAppDispatch();
    const isAuthenticated = Boolean(getAuthToken());

    const { data: user, isLoading: isUserLoading } = useGetCurrentUserQuery(undefined, {
        skip: !isAuthenticated,
    });

    const isOwner = !customerId || user?.customer_id === customerId;

    const publicUserQuery = useGetCustomerQuery(customerId ?? '', {
        skip: !customerId || isOwner,
    });

    const profileUser = isOwner ? user : publicUserQuery.data;

    useLayoutEffect(() => setTitle('Профиль'), [setTitle]);

    const handleOpenAuth = () => openModal('auth');

    const handleLogout = () => dispatch(logout());

    return {
        isAuthenticated,
        isOwner,
        profileUser,
        isUserLoading,
        isPublicUserLoading: publicUserQuery.isLoading,
        openAuth: handleOpenAuth,
        onLogout: isOwner ? handleLogout : undefined,
    };
};
