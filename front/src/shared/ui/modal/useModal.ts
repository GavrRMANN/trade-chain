import { type MouseEvent, useEffect, useRef } from 'react';

type TUseModalParams = {
    isOpen: boolean;
    onOpen?: () => void;
    onClose?: () => void;
};

/** Управляет фокусом и событиями открытого модального окна. */
export const useModal = ({ isOpen, onOpen, onClose }: TUseModalParams) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const modalRoot = document.getElementById('modal-root');

    useEffect(() => {
        if (isOpen) {
            onOpen?.();
            overlayRef.current?.focus();
        }
    }, [isOpen, onOpen]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose?.();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose?.();
        }
    };

    return { modalRoot, overlayRef, handleOverlayClick };
};
