import { Link } from 'react-router-dom';

import { AuthForm } from '@features/auth';
import { Modal } from '@shared/ui/modal';

import Styles from './auth-modal.module.css';
import { useAuthModal } from '../lib';

export const AuthModal = () => {
    const { isAuthenticated, closeModal } = useAuthModal();

    if (isAuthenticated) {
        return null;
    }

    return (
        <Modal title="Вход и регистрация" isOpen onClose={closeModal}>
            <div className={Styles.content}>
                <p className={Styles.description}>
                    Войдите, чтобы покупать, продавать и находить нужные товары.
                </p>
                <AuthForm />
                {/* Прямой вход в подготовленный сценарий: на показе он нужен
                    чаще, чем обычная регистрация. */}
                <Link className={Styles['demo-link']} to="/demo">
                    Войти под демо-аккаунтом
                </Link>
            </div>
        </Modal>
    );
};
