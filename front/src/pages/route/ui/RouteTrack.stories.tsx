import type { Meta, StoryObj } from '@storybook/react-vite';

import { RouteTrack } from './RouteTrack';

const currentProduct = {
    product_id: 'current-product',
    customer_id: 'customer-1',
    title: 'Фотоаппарат',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=320',
    price: 24000,
    location: 'Москва',
    status: 'active' as const,
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-08T10:00:00Z',
};

const goalProduct = {
    product_id: 'goal-product',
    customer_id: 'customer-2',
    title: 'Ноутбук для работы',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=320',
    price: 78000,
    location: 'Санкт-Петербург',
    status: 'active' as const,
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-08T10:00:00Z',
};

const meta = {
    title: 'Pages/RouteTrack',
    component: RouteTrack,
    args: {
        currentProduct,
        goalProduct,
        stepsRemaining: 2,
        onOpenProduct: () => undefined,
    },
} satisfies Meta<typeof RouteTrack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithGoalProduct: Story = {};

export const CategoryGoal: Story = {
    args: {
        goalProduct: undefined,
        categoryName: 'Электроника',
        stepsRemaining: 0,
    },
};

export const Completed: Story = {
    args: { stepsRemaining: 0 },
};
