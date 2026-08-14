import type { TReview } from '../types';

import { Rating } from '@shared/ui/rating';
import { formatDate } from '@shared/lib';

import Styles from './ReviewCard.module.css';

type TReviewCardProps = {
    review: TReview;
    className?: string;
};

/**
 * Карточка отзыва: рейтинг, дата и комментарий.
 * Используется и в карточке товара, и в профиле — единое представление.
 */
export const ReviewCard = ({ review, className }: TReviewCardProps) => {
    const classes = [Styles['review-card'], className].filter(Boolean).join(' ');

    return (
        <article className={classes}>
            <header className={Styles['review-card__head']}>
                <Rating value={review.rating} />
                <span className={Styles['review-card__date']}>{formatDate(review.created_at)}</span>
            </header>
            {review.comment && <p className={Styles['review-card__comment']}>{review.comment}</p>}
        </article>
    );
};
