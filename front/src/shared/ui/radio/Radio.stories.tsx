import type { Meta, StoryObj } from '@storybook/react-vite';
import { Radio } from './Radio';

const meta = {
    title: 'Shared/Radio',
    component: Radio,
    args: { label: 'Самовывоз', checked: true, name: 'delivery' },
} satisfies Meta<typeof Radio>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Checked: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Error: Story = {
    args: { checked: false, error: { showError: true, errorMessage: 'Выберите способ доставки' } },
};
