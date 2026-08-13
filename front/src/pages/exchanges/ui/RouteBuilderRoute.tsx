import {Modal} from '@shared/ui/modal';
import {MainSection} from '@shared/ui/mainSection';
import {PageHeader} from '@shared/ui/pageHeader';
import {Button} from '@shared/ui/button';
import {useCloseModalRoute, useIsMobile} from '@shared/lib';
import {RouteBuilder} from '@features/routeBuilder';

/** Создание цепочки обменов как маршрут `/exchanges/new`. */
export const RouteBuilderRoute = () => {
    const closeModal = useCloseModalRoute('/exchanges');
    const isMobile = useIsMobile();

    /* На телефоне это отдельная страница, а не модалка: полноэкранный лист
       поверх текущего экрана хуже читается на маленьком экране, чем обычная
       страница со своей навигацией назад. */
    if (isMobile) {
        return (
            <MainSection>
                <PageHeader
                    title="Создание цепочки"
                    compactActions
                    actions={
                        <Button variant="text" onClick={closeModal}>
                            Отмена
                        </Button>
                    }
                />
                <RouteBuilder variant="page" onCancel={closeModal} />
            </MainSection>
        );
    }

    return (
        <Modal title="Создание цепочки" isOpen size="large" onClose={closeModal}>
            <RouteBuilder variant="modal" onCancel={closeModal} />
        </Modal>
    );
};
