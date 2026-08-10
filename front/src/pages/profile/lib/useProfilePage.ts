import { useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useGetCurrentUserQuery, logout } from '@entities/user';
import { useGetCustomerQuery } from '@entities/customer';
import { usePageTitle } from '@app/providers/pageTitle';
import { useAppDispatch } from '@app/redux';

export const useProfilePage = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const { setTitle } = usePageTitle();
    const dispatch = useAppDispatch();

    const { data: user, isLoading: isUserLoading } = useGetCurrentUserQuery();

    const isOwner = !customerId || user?.customer_id === customerId;

    const publicUserQuery = useGetCustomerQuery(customerId ?? '', {
        skip: !customerId || isOwner,
    });

    const profileUser = isOwner ? user : publicUserQuery.data;

    useLayoutEffect(() => setTitle('Профиль'), [setTitle]);

    const handleLogout = () => dispatch(logout());

    return {
        isOwner,
        profileUser,
        isUserLoading,
        isPublicUserLoading: publicUserQuery.isLoading,
        onLogout: isOwner ? handleLogout : undefined,
    };
};
