import type { KeyboardEvent } from 'react';

import { useImageAvailability } from '@shared/lib';

import Styles from './ProductCard.module.css';

export const useProductCard = ({
    image,
    variant,
    onClick,
}: {
    image?: string;
    variant: 'vertical' | 'horizontal';
    onClick?: () => void;
}) => {
    const { isImageAvailable } = useImageAvailability(image);
    const className = [
        Styles['product-card'],
        Styles[`product-card--${variant}`],
        onClick && Styles['product-card--clickable'],
    ]
        .filter(Boolean)
        .join(' ');
    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === 'Enter') {
            onClick?.();
        }
    };

    return { isImageAvailable, className, handleKeyDown };
};
