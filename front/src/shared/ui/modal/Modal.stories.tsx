import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { Button } from '../button';
import { Modal } from './Modal';

const ModalExample = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [isRootReady, setIsRootReady] = useState(false);

    useEffect(() => {
        const root = document.createElement('div');
        root.id = 'modal-root';
        document.body.append(root);
        setIsRootReady(true);

        return () => root.remove();
    }, []);

    return isRootReady ? (
        <Modal
            isOpen={isOpen}
            title="Удалить объявление?"
            onClose={() => setIsOpen(false)}
            footer={
                <>
                    <Button variant="secondary" onClick={() => setIsOpen(false)}>
                        Отмена
                    </Button>
                    <Button onClick={() => setIsOpen(false)}>Удалить</Button>
                </>
            }
        >
            Объявление будет удалено без возможности восстановления.
        </Modal>
    ) : null;
};

const meta = {
    title: 'Shared/Modal',
    component: Modal,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Modal>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
    args: { isOpen: true },
    render: () => <ModalExample />,
};
