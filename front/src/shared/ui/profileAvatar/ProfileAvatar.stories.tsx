import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProfileAvatar } from './ProfileAvatar';

const meta = {
    title: 'Shared/ProfileAvatar',
    component: ProfileAvatar,
    args: { alt: 'Аватар пользователя', useIcon: true },
} satisfies Meta<typeof ProfileAvatar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Fallback: Story = {};
export const Active: Story = { args: { isActive: true, size: 'large' } };
