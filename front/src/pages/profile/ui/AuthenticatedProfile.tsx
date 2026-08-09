import { useGetCurrentUserQuery } from '@entities/user';
import { useProfile } from '@pages/profile/lib';
import { MainSection } from '@shared/ui/mainSection';
import { ProfileContent } from '@shared/ui/profileContent';

export const AuthenticatedProfile = ({
    user,
    isPublic = false,
    onLogout,
}: {
    user: NonNullable<ReturnType<typeof useGetCurrentUserQuery>>['data'];
    isPublic?: boolean;
    onLogout?: () => void;
}) => {
    const profile = useProfile(user);

    return (
        <MainSection>
            <ProfileContent user={user} isPublic={isPublic} viewModel={{ ...profile, onLogout }} />
        </MainSection>
    );
};