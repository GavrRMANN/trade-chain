import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProductGrid } from './ProductGrid';

const meta = {
    title: 'Pages/ProductGrid',
    component: ProductGrid,
    args: {
        products: [
            {
                product_id: 'product-1',
                customer_id: 'customer-1',
                title: 'Игровая приставка',
                image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=320',
                price: 13990,
                location: 'Москва',
                status: 'active',
                matched: true,
                created_at: '2026-08-01T10:00:00Z',
                updated_at: '2026-08-08T10:00:00Z',
            },
            {
                product_id: 'product-2',
                customer_id: 'customer-2',
                title: 'Горный велосипед',
                image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=320',
                price: 22000,
                location: 'Санкт-Петербург',
                status: 'active',
                created_at: '2026-08-02T10:00:00Z',
                updated_at: '2026-08-09T10:00:00Z',
            },
            {
                product_id: 'product-3',
                customer_id: 'customer-3',
                title: 'Фотоаппарат',
                price: 24000,
                location: 'Казань',
                status: 'active',
                created_at: '2026-08-03T10:00:00Z',
                updated_at: '2026-08-10T10:00:00Z',
            },
        ],
        onOpen: () => undefined,
    },
} satisfies Meta<typeof ProductGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { args: { products: [] } };
