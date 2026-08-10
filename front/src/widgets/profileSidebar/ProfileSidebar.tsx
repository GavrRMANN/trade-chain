import { ProfileAvatar } from '@shared/ui/profileAvatar';
import { Button } from '@shared/ui/button';
import {Rating} from '@shared/ui/rating';
import Styles from './profileSidebar.module.css';

type TProfileSidebarProps = {
    name: string;
    createdAt: string;
    rating: number;
    reviewsCount: number;
    productsCount: number;
    exchangesCount?: number;
    onReviewsClick: () => void;
    onLogout?: () => void;
};

const formatRegistrationDate = (date: string): string =>
    new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'long', year: 'numeric'}).format(new Date(date));

const formatReviewsCount = (count: number): string => {
    const lastTwo = count % 100;
    const last = count % 10;
    const word = lastTwo >= 11 && lastTwo <= 14
        ? 'отзывов'
        : last === 1
            ? 'отзыв'
            : last >= 2 && last <= 4
                ? 'отзыва'
                : 'отзывов';

    return `${count} ${word}`;
};

const formatCountWord = (count: number, one: string, few: string, many: string): string => {
    const lastTwo = count % 100;
    const last = count % 10;
    if (lastTwo >= 11 && lastTwo <= 14) return many;
    if (last === 1) return one;
    if (last >= 2 && last <= 4) return few;
    return many;
};

export const ProfileSidebar = ({
    name,
    createdAt,
    rating,
    reviewsCount,
    productsCount,
    exchangesCount,
    onReviewsClick,
    onLogout,
}: TProfileSidebarProps) => (
    <aside className={Styles.sidebar}>
        <div className={Styles.identity}>
            <ProfileAvatar useIcon size="huge" alt="Аватар пользователя" />
            <h1>{name}</h1>
            <p className={Styles.joined}>На сервисе с {formatRegistrationDate(createdAt)}</p>
            <div className={Styles.rating}>
                <strong>{rating.toFixed(1).replace('.', ',')}</strong>
                <Rating value={rating} tone="rating" className={Styles.ratingStars}/>
                <button type="button" className={Styles.reviewsLink} onClick={onReviewsClick}>
                    {formatReviewsCount(reviewsCount)}
                </button>
            </div>
        </div>
        <div className={Styles.counts} aria-label="Статистика профиля">
            <span>
                <b>{productsCount}</b> {formatCountWord(productsCount, 'товар', 'товара', 'товаров')}
            </span>
            {exchangesCount !== undefined && (
                <span>
                    <b>{exchangesCount}</b> {formatCountWord(exchangesCount, 'обмен', 'обмена', 'обменов')}
                </span>
            )}
        </div>
        {onLogout && (
            <div className={Styles.actions}>
                <Button variant="text" onClick={onLogout}>Выйти</Button>
            </div>
        )}
    </aside>
);
