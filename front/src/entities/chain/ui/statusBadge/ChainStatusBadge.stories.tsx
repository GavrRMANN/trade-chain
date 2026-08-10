import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChainStatusBadge } from './ChainStatusBadge';

const meta = { title: 'Entities/ChainStatusBadge', component: ChainStatusBadge } satisfies Meta<typeof ChainStatusBadge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Pending: Story = { args: { status: 'pending' } };
export const Active: Story = { args: { status: 'active' } };
export const Completed: Story = { args: { status: 'completed' } };
export const Cancelled: Story = { args: { status: 'cancelled' } };
export const Rejected: Story = { args: { status: 'rejected' } };
export const Countered: Story = { args: { status: 'countered' } };
export const Failed: Story = { args: { status: 'failed' } };
export const Expired: Story = { args: { status: 'expired' } };
