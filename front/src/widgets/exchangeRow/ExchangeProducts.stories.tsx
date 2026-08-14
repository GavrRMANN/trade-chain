import type { Meta, StoryObj } from '@storybook/react-vite';

import { ExchangeProducts } from './ExchangeProducts';

const product = (productId: string, title: string, image: string) => ({
    product_id: productId,
    customer_id: 'customer-1',
    title,
    image,
    price: 12000,
    location: 'Москва',
    status: 'active' as const,
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-08T10:00:00Z',
});

const meta = {
    title: 'Widgets/ExchangeProducts',
    component: ExchangeProducts,
    args: {
        first: {
            product: product(
                'product-1',
                'Горный велосипед',
                'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=320',
            ),
            label: 'Отдаю',
            tone: 'source',
            sellerEmail: 'ivan@example.com',
        },
        second: {
            product: product(
                'product-2',
                'Игровая приставка',
                'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=320',
            ),
            label: 'Получаю',
            tone: 'target',
        },
    },
} satisfies Meta<typeof ExchangeProducts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const UnavailableTarget: Story = {
    args: {
        second: { product: undefined, label: 'Получаю', tone: 'target' },
    },
};
