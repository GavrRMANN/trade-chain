import { useEffect, useReducer, useRef } from 'react';

import { checkImageUrl } from '@shared/lib/helpers';

/** Проверяет доступность изображения и обновляет состояние при смене ссылки. */
export const useImageAvailability = (src?: string) => {
    const [state, dispatch] = useReducer(
        (currentState: { isImageAvailable: boolean }, action: { type: 'reset' | 'setAvailability'; value?: boolean }) => {
            if (action.type === 'reset') {
                return { ...currentState, isImageAvailable: false };
            }

            return { ...currentState, isImageAvailable: action.value ?? false };
        },
        { isImageAvailable: false },
    );
    const controllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;

        dispatch({ type: 'reset' });

        if (!src) {
            return;
        }

        checkImageUrl(src, controller.signal).then((isAvailable) => {
            if (!controller.signal.aborted) {
                dispatch({ type: 'setAvailability', value: isAvailable });
            }
        });

        return () => {
            controller.abort();
        };
    }, [src]);

    return { isImageAvailable: state.isImageAvailable, markImageUnavailable: () => dispatch({ type: 'reset' }) };
};
