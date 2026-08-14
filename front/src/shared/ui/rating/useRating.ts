import Styles from './Rating.module.css';

const STAR_COUNT = 5;

export const useRating = ({
    value,
    tone,
    className,
}: {
    value: number;
    tone: 'success' | 'rating';
    className?: string;
}) => ({
    stars: Array.from({ length: STAR_COUNT }, (_, index) => index + 1),
    roundedValue: Math.round(value),
    maxValue: STAR_COUNT,
    className: [Styles.rating, Styles[`rating--${tone}`], className].filter(Boolean).join(' '),
});
