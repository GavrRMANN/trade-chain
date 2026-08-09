import { PageError } from '@shared/ui/pageError';
import { Preloader } from '@shared/ui/preloader';
import { AuthenticatedProfile } from '@pages/profile/ui/AuthenticatedProfile.tsx';

import { useProfilePage } from '../lib';

export const ProfilePage = () => {
    const {
        isOwner,
        profileUser,
        isUserLoading,
        isPublicUserLoading,
        onLogout,
    } = useProfilePage();

    if (isOwner ? isUserLoading : isPublicUserLoading) {
        return <Preloader message={'Загружаем профиль…'} />;
    }

    if (!profileUser)
        return <PageError message={'Не удалось загрузить профиль пользователя.'} />;

    return (
        <AuthenticatedProfile
            user={profileUser}
            isOwner={isOwner}
            onLogout={onLogout}
        />
    );
};
