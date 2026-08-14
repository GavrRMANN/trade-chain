import { useGetCurrentUserQuery } from '@entities/user';
import { useProfile } from '@pages/profile/lib';
import { MainSection } from '@shared/ui/mainSection';
import { ProfileContent } from './ProfileContent';

export const AuthenticatedProfile = ({
    user,
    isOwner,
    onLogout,
}: {
    user: NonNullable<ReturnType<typeof useGetCurrentUserQuery>>['data'];
    isOwner: boolean;
    onLogout?: () => void;
}) => {
    const profile = useProfile(user, isOwner);

    return (
        <MainSection>
            <ProfileContent user={user} isOwner={isOwner} viewModel={{ ...profile, onLogout }} />
        </MainSection>
    );
};
