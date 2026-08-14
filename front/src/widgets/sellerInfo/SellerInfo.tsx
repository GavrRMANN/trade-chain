import { ProfileAvatar } from '@shared/ui/profileAvatar';
import { Rating } from '@shared/ui/rating';
import { Link } from 'react-router-dom';
import Styles from './seller-info.module.css';

type TSellerInfoProps = {
    name: string;
    meta: string;
    /** Средняя оценка продавца. Звёзды рисуются, только если она известна и больше нуля. */
    rating?: number;
    hasRating?: boolean;
    profileId?: string;
};

export const SellerInfo = ({ name, meta, rating, hasRating, profileId }: TSellerInfoProps) => {
    const details = (
        <>
            <strong className={Styles.name}>{name}</strong>
            <span className={Styles.metaRow}>
                {hasRating && <Rating value={rating ?? 0} className={Styles.stars} />}
                <span className={Styles.metaText}>{meta}</span>
            </span>
        </>
    );

    return (
        <div className={Styles.seller}>
            {profileId ? (
                <Link
                    className={Styles.avatarLink}
                    to={`/profile/${profileId}`}
                    aria-label={`Открыть профиль ${name}`}
                >
                    <ProfileAvatar useIcon size="medium" alt={`Аватар ${name}`} />
                </Link>
            ) : (
                <span className={Styles.avatarLink}>
                    <ProfileAvatar useIcon size="medium" alt={`Аватар ${name}`} />
                </span>
            )}
            {profileId ? (
                <Link
                    className={`${Styles.detailsLink} ${Styles.details}`}
                    to={`/profile/${profileId}`}
                >
                    {details}
                </Link>
            ) : (
                <div className={Styles.details}>{details}</div>
            )}
        </div>
    );
};
