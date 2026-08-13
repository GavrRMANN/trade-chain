import Styles from './ProductCard.module.css';
import {formatAmount} from "@shared/lib";

import GeoSVG from '@shared/assets/icons/Geo.svg';
import {useProductCard} from './useProductCard';

type TProductCardProps = {
    title: string;
    img?: string;
    price?: number;
    location?: string;
    description?: string;
    variant?: 'vertical' | 'horizontal';
    /** Владельцу товара подходит что-то из вещей текущего пользователя. */
    matched?: boolean;
    onClick?: () => void;
}

export const ProductCard = ({
                                title,
                                img,
                                price,
                                location,
                                description,
                                variant = 'vertical',
                                matched = false,
                                onClick,
                            }: TProductCardProps) => {
    const {isImageAvailable, className, handleKeyDown} = useProductCard({image: img, variant, onClick});

    return (
        <article
            className={className}
            onClick={onClick}
            role={onClick ? 'link' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? handleKeyDown : undefined}
        >
            <div className={Styles['image-container']}>
                {isImageAvailable ? (
                    <img src={img} alt={title}/>
                ) : (
                    <p className={Styles['image-title']}>{title}</p>
                )}

                {/* Плашка отвечает на вопрос «почему мне это показали» до того,
                    как пользователь откроет объявление. */}
                {matched && <span className={Styles.matched}>Подходит вам</span>}
            </div>

            <div className={Styles['desc-container']}>
                <h4 className={Styles.title}>{title}</h4>
                {description && <p className={Styles.description}>{description}</p>}
                <div className={Styles['info']}>
                    {price !== undefined && (
                        <p className={Styles.amount}>{formatAmount(price)}</p>
                    )}

                    {location && (
                        <div className={Styles['location-block']}>
                            <img src={GeoSVG} alt="Геометка"/>
                            <p className={Styles['location']}>{location}</p>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
};
