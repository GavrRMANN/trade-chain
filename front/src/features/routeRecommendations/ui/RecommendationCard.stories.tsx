import type { Meta, StoryObj } from '@storybook/react-vite';
import { RecommendationCard } from './RecommendationCard';

const product = {
    product_id: 'product-1',
    customer_id: 'customer-1',
    title: 'Ноутбук для работы',
    price: 65000,
    location: 'Москва',
    status: 'active' as const,
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-08T10:00:00Z',
};
const meta = {
    title: 'Features/RecommendationCard',
    component: RecommendationCard,
    args: {
        item: { product },
        selected: false,
        onToggle: () => undefined,
        onOpenProduct: () => undefined,
        onOpenOffer: () => undefined,
    },
} satisfies Meta<typeof RecommendationCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Available: Story = {};
export const Selected: Story = { args: { selected: true } };
export const Sent: Story = {
    args: {
        item: {
            product,
            offer: {
                chain_id: 'chain-1',
                from_product_id: 'from',
                to_product_id: 'to',
                initiator_id: 'customer-1',
                status: 'pending',
                created_at: '2026-08-01T10:00:00Z',
                updated_at: '2026-08-08T10:00:00Z',
            },
        },
    },
};
export const Compact: Story = { args: { compact: true } };
