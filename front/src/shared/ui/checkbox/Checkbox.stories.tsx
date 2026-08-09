import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox';

const meta = {
    title: 'Shared/Checkbox',
    component: Checkbox,
    args: { label: 'Получать уведомления', checked: true },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Checked: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Error: Story = {
    args: { checked: false, error: { showError: true, errorMessage: 'Подтвердите согласие' } },
};
