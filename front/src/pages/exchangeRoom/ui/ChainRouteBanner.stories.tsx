import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChainRouteBanner } from './ChainRouteBanner';

const meta = {
    title: 'Pages/ChainRouteBanner',
    component: ChainRouteBanner,
    args: {
        route: {
            goalTitle: 'Ноутбук для работы',
            goalProduct: {
                product_id: 'goal-product',
                customer_id: 'customer-1',
                title: 'Ноутбук для работы',
                image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=320',
                price: 78000,
                location: 'Москва',
                status: 'active',
                created_at: '2026-08-01T10:00:00Z',
                updated_at: '2026-08-08T10:00:00Z',
            },
            isOwnRoute: true,
            progressLabel: 'Шаг 2 · пройдено 1 обмен · 1 предложение в работе',
            openRoute: () => undefined,
        },
    },
} satisfies Meta<typeof ChainRouteBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OwnRoute: Story = {};

export const PartnerRoute: Story = {
    args: {
        route: {
            goalTitle: 'Любая вещь: Электроника',
            isOwnRoute: false,
            progressLabel: 'Партнёр идёт к своей цели — этот обмен один из шагов пути',
        },
    },
};
