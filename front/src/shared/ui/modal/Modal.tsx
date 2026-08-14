import { forwardRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import Styles from './Modal.module.css';
import { Button } from '../button';

import XMarkSVG from '../../assets/icons/X-mark.svg?react';
import { Transition } from 'react-transition-group';
import { useModal } from './useModal';

type TModalProps = {
    title?: string;
    isOpen: boolean;
    size?: 'default' | 'large';
    onOpen?: () => void;
    onClose?: () => void;
    children?: ReactNode;
    footer?: ReactNode;
};

export const Modal = forwardRef<HTMLDivElement, TModalProps>(
    ({ title = '', isOpen, size = 'default', onOpen, onClose, children, footer }, ref) => {
        const { modalRoot, overlayRef, handleOverlayClick } = useModal({ isOpen, onOpen, onClose });

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
                        onClick={handleOverlayClick}
                    >
                        <div
                            ref={ref}
                            className={`${Styles['modal']} ${Styles[`modal--${size}`]}`}
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
