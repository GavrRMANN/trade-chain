import { useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useGetCurrentUserQuery } from '@entities/user';
import { useGetCustomerQuery } from '@entities/customer';
import { logout } from '@entities/user';
import { getAuthToken } from '@shared/api';
import { useOpenModalRoute } from '@shared/lib';
import { Button } from '@shared/ui/button';
import { MainSection } from '@shared/ui/mainSection';
import { ProfileAvatar } from '@shared/ui/profileAvatar';
import { ProfileContent } from '@shared/ui/profileContent';
import { usePageTitle } from '@app/providers/pageTitle';
import { useAppDispatch } from '@app/redux';

import { useProfile } from '../lib/useProfile';
import Styles from './profile-page.module.css';

export const ProfilePage = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const openModal = useOpenModalRoute();
    const { setTitle } = usePageTitle();
    const dispatch = useAppDispatch();
    const isAuthenticated = Boolean(getAuthToken());
    const { data: user, isLoading: isUserLoading } = useGetCurrentUserQuery(undefined, { skip: !isAuthenticated });
    const publicUserQuery = useGetCustomerQuery(customerId ?? '', { skip: !customerId });
    const profileUser = customerId ? publicUserQuery.data : user;

    useLayoutEffect(() => setTitle('Профиль'), [setTitle]);

    if (!customerId && !isAuthenticated) {
        return <MainSection><section className={Styles.guestCard}>
            <ProfileAvatar useIcon size="huge" alt="Профиль пользователя" />
            <div><h2>Войдите, чтобы открыть профиль</h2><p>Добавляйте вещи, сохраняйте понравившиеся объявления и договаривайтесь об обмене.</p><Button onClick={() => openModal('auth')}>Войти или зарегистрироваться</Button></div>
        </section></MainSection>;
    }

    if ((customerId && publicUserQuery.isLoading) || (!customerId && isUserLoading)) {
        return <div className={Styles.state}>Загружаем профиль…</div>;
    }

    if (!profileUser) return <div className={Styles.state}>Не удалось загрузить профиль пользователя.</div>;

    return <AuthenticatedProfile user={profileUser} isPublic={Boolean(customerId)} onLogout={customerId ? undefined : () => dispatch(logout())} />;
};

const AuthenticatedProfile = ({ user, isPublic = false, onLogout }: { user: NonNullable<ReturnType<typeof useGetCurrentUserQuery>>['data']; isPublic?: boolean; onLogout?: () => void }) => {
    const profile = useProfile(user);

    return <MainSection>
        <ProfileContent user={user} isPublic={isPublic} viewModel={{ ...profile, onLogout }} />
    </MainSection>;
};
