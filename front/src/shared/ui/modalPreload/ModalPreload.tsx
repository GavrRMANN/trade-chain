import { Modal } from '@shared/ui/modal';
import { Preloader } from '@shared/ui/preloader';

export const ModalPreload = () => {
    return <Modal isOpen={true} children={<Preloader />} />;
};
