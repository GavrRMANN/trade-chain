import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProductCard } from './ProductCard';

const product = {
    product_id: 'product-1',
    customer_id: 'customer-1',
    title: 'Игровая приставка',
    price: 13990,
    location: 'Москва',
    status: 'active' as const,
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-08T10:00:00Z',
};
const meta = {
    title: 'Widgets/ExchangeProductCard',
    component: ProductCard,
    args: { product, label: 'Получаю', tone: 'target' },
} satisfies Meta<typeof ProductCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const WithProduct: Story = {};
export const Unavailable: Story = { args: { product: undefined, sellerEmail: undefined } };
export const Source: Story = {
    args: { tone: 'source', label: 'Отдаю', sellerEmail: 'seller@example.com' },
};
