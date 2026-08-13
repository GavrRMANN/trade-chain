import {Modal} from '@shared/ui/modal';
import {useCloseModalRoute} from '@shared/lib';
import {RouteBuilder} from '@features/routeBuilder';

/** Создание цепочки обменов как маршрут `/exchanges/new`. */
export const RouteBuilderRoute = () => {
    const closeModal = useCloseModalRoute('/exchanges');

    return (
        <Modal title="Создание цепочки" isOpen size="large" onClose={closeModal}>
            <RouteBuilder variant="modal" onCancel={closeModal} />
        </Modal>
    );
};
