import type {TReview} from '@entities/review';
import {ReviewCard} from '@shared/ui/reviewCard';
import {Empty} from 'antd';

import Styles from './profileContent.module.css';

type TReviewsPaneProps = {
    reviews: TReview[];
};

/** Отзывы, оставленные другими пользователями. */
export const ReviewsPane = ({reviews}: TReviewsPaneProps) => {
    if (reviews.length === 0) {
        return (
            <div className={Styles.empty}>
                <Empty description="Отзывов пока нет"/>
            </div>
        );
    }
    return (
        <div className={Styles.paneList}>
            {reviews.map((review) => (
                <ReviewCard key={review.review_id} review={review}/>
            ))}
        </div>
    );
};
