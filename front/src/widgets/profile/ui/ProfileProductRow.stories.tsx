import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProfileProductRow } from './ProfileProductRow';

const product = {
    product_id: 'product-1',
    customer_id: 'customer-1',
    title: 'Велосипед Merida',
    description: 'Лёгкий городской велосипед в отличном состоянии.',
    price: 45000,
    location: 'Москва',
    status: 'active' as const,
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-08T10:00:00Z',
};
const meta = {
    title: 'Widgets/ProfileProductRow',
    component: ProfileProductRow,
    args: { product, isOwner: true, onOpen: () => undefined, onEdit: () => undefined },
} satisfies Meta<typeof ProfileProductRow>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Owner: Story = {};
export const Visitor: Story = { args: { isOwner: false } };
export const Archived: Story = { args: { product: { ...product, status: 'archived' } } };
