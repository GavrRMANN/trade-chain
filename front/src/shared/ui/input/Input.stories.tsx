import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

const meta = {
    title: 'Shared/Input',
    component: Input,
    args: { label: 'Название', value: 'Велосипед', placeholder: 'Введите название' },
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Error: Story = {
    args: { value: '', error: { showError: true, errorMessage: 'Поле обязательно' } },
};
