import { useEffect, useRef, useState } from 'react';

import { checkImageUrl } from '@shared/lib/helpers';

/** Проверяет доступность изображения и обновляет состояние при смене ссылки. */
export const useImageAvailability = (src?: string) => {
    const [isImageAvailable, setIsImageAvailable] = useState(false);
    const controllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;

        setIsImageAvailable(false);

        if (!src) {
            return;
        }

        checkImageUrl(src, controller.signal).then((isAvailable) => {
            if (!controller.signal.aborted) {
                setIsImageAvailable(isAvailable);
            }
        });

        return () => {
            controller.abort();
        };
    }, [src]);

    return { isImageAvailable, markImageUnavailable: () => setIsImageAvailable(false) };
};
