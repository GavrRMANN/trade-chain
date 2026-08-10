import { ProfileAvatar } from '@shared/ui/profileAvatar';
import { Link } from 'react-router-dom';
import Styles from './seller-info.module.css';

type TSellerInfoProps = { name: string; meta: string; profileId?: string };

export const SellerInfo = ({ name, meta, profileId }: TSellerInfoProps) => (
    <div className={Styles.seller}>
        {profileId ? (
            <Link className={Styles.profileLink} to={`/profile/${profileId}`} aria-label={`Открыть профиль ${name}`}>
                <ProfileAvatar useIcon size="medium" alt={`Аватар ${name}`} />
            </Link>
        ) : (
            <ProfileAvatar useIcon size="medium" alt={`Аватар ${name}`} />
        )}
        {profileId ? (
            <Link className={`${Styles.profileLink} ${Styles.details}`} to={`/profile/${profileId}`}>
                <strong>{name}</strong><span>{meta}</span>
            </Link>
        ) : (
            <div className={Styles.details}><strong>{name}</strong><span>{meta}</span></div>
        )}
    </div>
);
