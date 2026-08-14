import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReviewCard } from './ReviewCard';

const review = {
    review_id: 'review-1',
    from_customer_id: 'customer-1',
    to_customer_id: 'customer-2',
    rating: 5,
    comment: 'Отличный обмен, всё прошло быстро и честно.',
    created_at: '2026-08-08T12:00:00Z',
    updated_at: '2026-08-08T12:00:00Z',
};
const meta = {
    title: 'Entities/ReviewCard',
    component: ReviewCard,
    args: { review },
} satisfies Meta<typeof ReviewCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const WithComment: Story = {};
export const WithoutComment: Story = {
    args: { review: { ...review, rating: 3, comment: undefined } },
};
