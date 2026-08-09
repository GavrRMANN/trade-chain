import { useEffect, useState } from 'react';

import { checkImageUrl } from '@shared/lib/helpers';

/** Проверяет доступность изображения и обновляет состояние при смене ссылки. */
export const useImageAvailability = (src?: string) => {
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

    return { isImageAvailable, markImageUnavailable: () => setIsImageAvailable(false) };
};
