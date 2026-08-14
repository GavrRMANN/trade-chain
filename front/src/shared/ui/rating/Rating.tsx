import StarSVG from '../../assets/icons/Star.svg?react';

import Styles from './Rating.module.css';
import { useRating } from './useRating';

type TRatingProps = {
    value: number;
    className?: string;
    tone?: 'success' | 'rating';
};

export const Rating = ({ value, className, tone = 'success' }: TRatingProps) => {
    const {
        stars,
        roundedValue,
        maxValue,
        className: ratingClassName,
    } = useRating({ value, tone, className });

    return (
        <div className={ratingClassName} role="img" aria-label={`Рейтинг ${value} из ${maxValue}`}>
            {stars.map((star) => (
                <StarSVG
                    key={star}
                    className={[
                        Styles.rating__star,
                        star <= roundedValue ? Styles['rating__star--filled'] : '',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                />
            ))}
        </div>
    );
};
