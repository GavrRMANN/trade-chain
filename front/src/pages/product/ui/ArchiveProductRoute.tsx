import { useParams } from 'react-router-dom';

import { Button } from '@shared/ui/button';
import { Modal } from '@shared/ui/modal';
import { useCloseModalRoute } from '@shared/lib';

import { useArchiveProduct } from '../lib';
import Styles from './archive-product-route.module.css';

/**
 * Подтверждение снятия товара с обмена как маршрут
 * `/product/:productId/archive`.
 */
export const ArchiveProductRoute = () => {
    const { productId = '' } = useParams<{ productId: string }>();
    const closeModal = useCloseModalRoute(productId ? `/product/${productId}` : '/');
    const { confirm, isLoading, error } = useArchiveProduct(productId, closeModal);

    return (
        <Modal title="Подтвердите действие" isOpen onClose={closeModal}>
            <div className={Styles.confirm}>
                <p>Снять товар с обмена? Он уйдёт в архив и перестанет участвовать в обменах.</p>
                {error && <p className={Styles.error}>{error}</p>}
                <div className={Styles.actions}>
                    <Button loading={isLoading} disabled={isLoading} onClick={confirm}>
                        Снять с обмена
                    </Button>
                    <Button variant="text" onClick={closeModal} disabled={isLoading}>
                        Отмена
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
