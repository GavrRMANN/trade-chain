import StarSVG from '../../assets/icons/Star.svg?react';

import Styles from './Rating.module.css';

type TRatingProps = {
    value: number;
    className?: string;
    tone?: 'success' | 'rating';
};

const STAR_COUNT = 5;

export const Rating = ({value, className, tone = 'success'}: TRatingProps) => {
    const rounded = Math.round(value);
    const items = Array.from({length: STAR_COUNT}, (_, index) => index + 1);

    const classes = [Styles.rating, Styles[`rating--${tone}`], className].filter(Boolean).join(' ');

    return (
        <div className={classes} role="img" aria-label={`Рейтинг ${value} из ${STAR_COUNT}`}>
            {items.map((star) => (
                <StarSVG
                    key={star}
                    className={[
                        Styles.rating__star,
                        star <= rounded ? Styles['rating__star--filled'] : '',
                    ]
                        .filter(Boolean)
                        .join(' ')}
                />
            ))}
        </div>
    );
};
