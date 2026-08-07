import Styles from './ProductCard.module.css';
import {checkImageUrl, formatAmount} from "@shared/lib";

import GeoSVG from '../../assets/icons/Geo.svg';
import {useEffect, useState} from "react";

type TProductCardProps = {
    title: string;
    img?: string;
    price?: number;
    location?: string;
    onClick?: () => void;
}

export const ProductCard = ({
                                title,
                                img,
                                price,
                                location,
                                onClick,
                            }: TProductCardProps) => {
    const [isImageAvailable, setIsImageAvailable] = useState(false);

    useEffect(() => {
        let cancelled = false;


        setIsImageAvailable(false);

        if (!img) {
            return;
        }

        checkImageUrl(img).then((isAvailable) => {
            if (!cancelled) {
                setIsImageAvailable(isAvailable);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [img]);

    return (
        <article className={Styles['product-card']} onClick={onClick}>
            <div className={Styles['image-container']}>
                {isImageAvailable ? (
                    <img src={img} alt={title}/>
                ) : (
                    <p className={Styles['image-title']}>{title}</p>
                )}
            </div>

            <div className={Styles['desc-container']}>
                <h4 className={Styles.title}>{title}</h4>
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
        </article>
    );
};
