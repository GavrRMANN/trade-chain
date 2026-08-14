import type { Meta, StoryObj } from '@storybook/react-vite';

import { RouteGroupCard } from './RouteGroupCard';

const meta = {
    title: 'Pages/Exchanges/RouteGroupCard',
    component: RouteGroupCard,
    args: {
        sourceProduct: {
            product_id: 'product-console',
            customer_id: 'customer-1',
            title: 'Игровая приставка PlayStation 4',
            image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=800&q=80',
            price: 22000,
            location: 'Москва',
            status: 'active',
            created_at: '2026-08-01T10:00:00Z',
            updated_at: '2026-08-08T10:00:00Z',
        },
        goalProduct: {
            product_id: 'product-laptop',
            customer_id: 'customer-2',
            title: 'Ноутбук для работы',
            image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
            price: 60000,
            location: 'Москва',
            status: 'active',
            created_at: '2026-07-28T10:00:00Z',
            updated_at: '2026-08-08T10:00:00Z',
        },
        openOffersCount: 2,
        offersCount: 4,
        updatedAt: '2026-08-08T10:00:00Z',
        onOpen: () => undefined,
        formatActiveOffers: (count) => `${count} активных предложения`,
        formatDate: () => 'сегодня',
    },
    decorators: [
        (Story) => (
            <div style={{ maxWidth: '760px' }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof RouteGroupCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutActiveOffers: Story = {
    args: { openOffersCount: 0, offersCount: 1 },
};
