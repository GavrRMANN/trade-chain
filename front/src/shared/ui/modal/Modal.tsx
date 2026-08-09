import { forwardRef, type MouseEvent, type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import Styles from './Modal.module.css';
import { Button } from '../button';

import XMarkSVG from '../../assets/icons/X-mark.svg?react';
import { Transition } from 'react-transition-group';

type TModalProps = {
    title?: string;
    isOpen: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    children?: ReactNode;
    footer?: ReactNode;
};

export const Modal = forwardRef<HTMLDivElement, TModalProps>(
    ({ title = '', isOpen, onOpen, onClose, children, footer }, ref) => {
        const modalRoot = document.getElementById('modal-root');
        const overlayRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            if (isOpen) {
                onOpen?.();
            }
        }, [isOpen, onOpen]);

        useEffect(() => {
            if (isOpen) {
                overlayRef.current?.focus();
            }
        }, [isOpen]);

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

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        }, [isOpen, onClose]);

        const onOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
            if (event.target === event.currentTarget) {
                onClose?.();
            }
        };

        if (!modalRoot) {
            return null;
        }

        return createPortal(
            <Transition in={isOpen} nodeRef={overlayRef} timeout={100} mountOnEnter unmountOnExit>
                {(state) => (
                    <div
                        tabIndex={-1}
                        ref={overlayRef}
                        className={`${Styles['overlay']} ${Styles[`overlay--${state}`]}`}
                        onClick={onOverlayClick}
                    >
                        <div
                            ref={ref}
                            className={Styles['modal']}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="modal-title"
                        >
                            <div className={Styles['modal__title']}>
                                <h2 id="modal-title">{title}</h2>

                                <Button
                                    variant={'default'}
                                    icon={<XMarkSVG />}
                                    onClick={onClose}
                                    ariaLabel="Закрыть"
                                />
                            </div>
                            <div className={Styles['modal__container']}>{children}</div>
                            {footer && <div className={Styles['modal__footer']}>{footer}</div>}
                        </div>
                    </div>
                )}
            </Transition>,
            modalRoot,
        );
    },
);

Modal.displayName = 'Modal';
