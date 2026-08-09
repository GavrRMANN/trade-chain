import { Button } from '@shared/ui/button';
import { MainSection } from '@shared/ui/mainSection';
import { ProfileAvatar } from '@shared/ui/profileAvatar';
import { PageError } from '@shared/ui/pageError';
import { Preloader } from '@shared/ui/preloader';
import { AuthenticatedProfile } from '@pages/profile/ui/AuthenticatedProfile.tsx';

import Styles from './profile-page.module.css';
import { useProfilePage } from '../lib';

export const ProfilePage = () => {
    const {
        isAuthenticated,
        isOwner,
        profileUser,
        isUserLoading,
        isPublicUserLoading,
        openAuth,
        onLogout,
    } = useProfilePage();

    if (!isAuthenticated) {
        return (
            <MainSection>
                <section className={Styles.guestCard}>
                    <ProfileAvatar useIcon size="huge" alt="Профиль пользователя" />
                    <div>
                        <h2>Войдите, чтобы открыть профиль</h2>
                        <p>
                            Добавляйте вещи, сохраняйте понравившиеся объявления и договаривайтесь
                            об обмене.
                        </p>
                        <Button onClick={openAuth}>
                            Войти или зарегистрироваться
                        </Button>
                    </div>
                </section>
            </MainSection>
        );
    }

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
