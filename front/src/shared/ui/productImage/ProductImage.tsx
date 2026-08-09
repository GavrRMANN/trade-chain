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
                <span className={Styles.imagePlaceholder} role="img" aria-label={alt || title}>
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M5 7.5h2l1.2-2h7.6l1.2 2h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" />
                        <circle cx="12" cy="13.5" r="3" />
                    </svg>
                </span>
            )}
        </div>
    );
};
