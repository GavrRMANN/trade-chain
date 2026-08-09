import type { Meta, StoryObj } from '@storybook/react-vite';
import { Rating } from './Rating';

const meta = { title: 'Shared/Rating', component: Rating } satisfies Meta<typeof Rating>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Empty: Story = { args: { value: 0 } };
export const Partial: Story = { args: { value: 3.5 } };
export const Excellent: Story = { args: { value: 5, tone: 'rating' } };
