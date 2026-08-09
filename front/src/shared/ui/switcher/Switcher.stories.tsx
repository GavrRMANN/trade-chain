import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switcher } from './Switcher';

const meta = {
    title: 'Shared/Switcher',
    component: Switcher,
    args: { label: 'Показывать номер телефона', checked: true },
} satisfies Meta<typeof Switcher>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Enabled: Story = {};
export const Disabled: Story = { args: { disabled: true } };
