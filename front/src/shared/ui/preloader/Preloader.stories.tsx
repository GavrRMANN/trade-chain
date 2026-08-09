import type { Meta, StoryObj } from '@storybook/react-vite';
import { Preloader } from './Preloader';

const meta = { title: 'Shared/Preloader', component: Preloader } satisfies Meta<typeof Preloader>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Message: Story = {
    args: {
        message: 'Загружаем профиль…',
    },
};
