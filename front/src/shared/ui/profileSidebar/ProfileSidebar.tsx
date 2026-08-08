import { ProfileAvatar } from '@shared/ui/profileAvatar';
import { Button } from '@shared/ui/button';
import Styles from './profileSidebar.module.css';

type TProfileSidebarProps = {
    name: string;
    rating: number;
    reviewsCount: number;
    activeListingsCount: number;
    archivedListingsCount: number;
    onLogout?: () => void;
};

export const ProfileSidebar = ({ name, rating, reviewsCount, activeListingsCount, archivedListingsCount, onLogout }: TProfileSidebarProps) => (
    <aside className={Styles.sidebar}>
        <div className={Styles.identity}>
            <ProfileAvatar useIcon size="huge" alt="Аватар пользователя" />
            <h1>{name}</h1>
            <div className={Styles.rating}>
                <strong>{rating.toFixed(1).replace('.', ',')}</strong>
                <span aria-label={`Рейтинг ${rating} из 5`}>★★★★★</span>
                <a href="#reviews">{reviewsCount} отзывов</a>
            </div>
        </div>
        <div className={Styles.counts} aria-label="Количество объявлений">
            <span>Активные <b>{activeListingsCount}</b></span>
            <span>В архиве <b>{archivedListingsCount}</b></span>
        </div>
        {onLogout && <Button className={Styles.logout} variant="text" onClick={onLogout}>Выйти</Button>}
    </aside>
);
