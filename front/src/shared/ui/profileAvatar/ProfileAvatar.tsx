import { memo } from 'react';
import { Avatar } from 'antd';
import Styles from './profileAvatar.module.css';
import ProfileIconFallback from './assets/profileIcon.svg?react';
import type { TAvatarSize } from '@/shared/ui/profileAvatar/type.ts';

type TProfileAvatarProps = {
    useIcon?: boolean;
    isActive?: boolean;
    size?: TAvatarSize;
    src?: string;
    alt: string;
};

const ProfileSize = {
    small: 24,
    medium: 40,
    large: 64,
    huge: 92,
};

export const ProfileAvatar = memo(
    ({ useIcon = false, isActive = false, size = 'medium', src, alt }: TProfileAvatarProps) => {
        return (
            <Avatar
                className={`${Styles.profileAvatar__img} ${isActive ? Styles['profileAvatar__img--active'] : ''}`}
                size={ProfileSize[size]}
                src={!src && useIcon ? undefined : src}
                icon={useIcon || !src ? <ProfileIconFallback /> : undefined}
                alt={alt}
            />
        );
    },
);
