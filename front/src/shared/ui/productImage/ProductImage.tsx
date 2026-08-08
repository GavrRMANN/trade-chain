import { useEffect, useState } from 'react';

import { checkImageUrl } from '@shared/lib';
import Styles from './product-image.module.css';

type TProductImageProps = { src?: string; alt: string; title: string };

export const ProductImage = ({ src, alt, title }: TProductImageProps) => {
    const [isImageAvailable, setIsImageAvailable] = useState(false);

    useEffect(() => {
        let cancelled = false;

        setIsImageAvailable(false);

        if (!src) {
            return;
        }

        checkImageUrl(src).then((isAvailable) => {
            if (!cancelled) {
                setIsImageAvailable(isAvailable);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [src]);

    return (
        <div className={Styles.image}>
            {isImageAvailable ? (
                <img src={src} alt={alt} onError={() => setIsImageAvailable(false)} />
            ) : (
                <p className={Styles.imageTitle}>{title}</p>
            )}
        </div>
    );
};
