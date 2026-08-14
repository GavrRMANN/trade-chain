import { useRef, useCallback, type PointerEvent } from 'react';

type TSwipeCallbacks = {
    /** Сработает при свайпе влево (distance <= -threshold). */
    onSwipeLeft?: () => void;
    /** Сработает при свайпе вправо (distance >= threshold). */
    onSwipeRight?: () => void;
};

type TSwipeThreshold = number | ((distance: number) => 'left' | 'right' | null);

const DEFAULT_THRESHOLD = 60;

const resolveDirection = (
    distance: number,
    threshold: TSwipeThreshold,
): 'left' | 'right' | null => {
    if (typeof threshold === 'function') {
        return threshold(distance);
    }
    if (distance <= -threshold) {
        return 'left';
    }
    if (distance >= threshold) {
        return 'right';
    }
    return null;
};

/**
 * Хук для обработки swipe-жестов через Pointer Events.
 * Возвращает обработчики для onPointerDown / onPointerUp.
 */
export const useSwipeGesture = (
    callbacks: TSwipeCallbacks,
    threshold: TSwipeThreshold = DEFAULT_THRESHOLD,
) => {
    const startX = useRef<number | undefined>(undefined);

    const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
        startX.current = event.clientX;
        event.currentTarget.setPointerCapture(event.pointerId);
    }, []);

    const handlePointerUp = useCallback(
        (event: PointerEvent<HTMLDivElement>) => {
            if (startX.current === undefined) {
                return;
            }

            const distance = event.clientX - startX.current;
            startX.current = undefined;

            const direction = resolveDirection(distance, threshold);

            if (direction === 'left') {
                callbacks.onSwipeLeft?.();
            } else if (direction === 'right') {
                callbacks.onSwipeRight?.();
            }
        },
        [callbacks, threshold],
    );

    return { handlePointerDown, handlePointerUp };
};
