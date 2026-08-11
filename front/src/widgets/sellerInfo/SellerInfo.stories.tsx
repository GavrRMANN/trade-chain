import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { SellerInfo } from './SellerInfo';

const meta = {
    title: 'Widgets/SellerInfo',
    component: SellerInfo,
    decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
    args: { name: 'elena@example.com', meta: '5.0 · Отзывов: 1', rating: 5, hasRating: true },
} satisfies Meta<typeof SellerInfo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const WithoutProfileLink: Story = {};
export const WithProfileLink: Story = { args: { profileId: 'customer-1' } };
export const WithoutRating: Story = {
    args: { meta: 'Пока без отзывов', rating: undefined, hasRating: false },
};
export const WithReviewsButNoAverage: Story = {
    args: { meta: 'Отзывов: 3', rating: undefined, hasRating: false },
};
export const LongEmail: Story = {
    args: { name: 'very-long-seller-email-address@example-domain.com' },
};
