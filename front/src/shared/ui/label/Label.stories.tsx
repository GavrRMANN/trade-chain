import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from './Label';

const meta = {
    title: 'Shared/Label',
    component: Label,
    args: { label: 'Подпись', children: <input placeholder="Значение" /> },
} satisfies Meta<typeof Label>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Before: Story = {};
export const After: Story = { args: { position: 'after' } };
export const Error: Story = { args: { error: { showError: true, errorMessage: 'Ошибка в поле' } } };
