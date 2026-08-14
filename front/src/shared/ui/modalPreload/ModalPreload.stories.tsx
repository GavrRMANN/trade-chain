import type { Meta, StoryObj } from '@storybook/react-vite';
import { ModalPreload } from './ModalPreload';

const meta = {
    title: 'Shared/ModalPreload',
    component: ModalPreload,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ModalPreload>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Loading: Story = {};
