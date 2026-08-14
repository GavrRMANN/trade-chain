import type { Meta, StoryObj } from '@storybook/react-vite';

import type { TCustomerOverview } from '@entities/customer';
import type { TProduct } from '@entities/product';

import { ProductFeed } from './ProductFeed';

const products: TProduct[] = [
    {
        product_id: 'product-camera',
        customer_id: 'customer-alexey',
        category_id: 'category-photo',
        title: 'Зеркальный фотоаппарат Canon EOS 250D',
        description:
            'Лёгкая камера для путешествий и съёмки семьи. В комплекте объектив, ремень и две карты памяти.',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
        price: 42000,
        location: 'Москва',
        status: 'active',
        matched: true,
        created_at: '2026-08-01T10:00:00Z',
        updated_at: '2026-08-08T10:00:00Z',
    },
    {
        product_id: 'product-bike',
        customer_id: 'customer-elena',
        category_id: 'category-sport',
        title: 'Городской велосипед',
        description: 'Исправен, хранился в тёплом гараже.',
        image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80',
        price: 18000,
        location: 'Химки',
        status: 'active',
        created_at: '2026-07-20T10:00:00Z',
        updated_at: '2026-08-06T10:00:00Z',
    },
];

const owners = new Map<string, TCustomerOverview>([
    [
        'customer-alexey',
        {
            customer_id: 'customer-alexey',
            email: 'alexey@example.com',
            full_name: 'Алексей Смирнов',
            rating: 4.9,
            review_count: 12,
            product_count: 8,
            active_product_count: 3,
            chain_count: 15,
            created_at: '2025-10-01T10:00:00Z',
        },
    ],
    [
        'customer-elena',
        {
            customer_id: 'customer-elena',
            email: 'elena@example.com',
            full_name: 'Елена Кузнецова',
            rating: 0,
            review_count: 0,
            product_count: 4,
            active_product_count: 2,
            chain_count: 3,
            created_at: '2026-01-14T10:00:00Z',
        },
    ],
]);

const meta = {
    title: 'Widgets/ProductFeed',
    component: ProductFeed,
    args: {
        products,
        categoryNames: new Map([
            ['category-photo', 'Фототехника'],
            ['category-sport', 'Спорт и отдых'],
        ]),
        owners,
        goalTitle: 'Ноутбук для работы',
        onOpenProduct: () => undefined,
        onOpenOwner: () => undefined,
        onOfferExchange: () => undefined,
        onBuildRoute: () => undefined,
    },
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ProductFeed>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
    args: { products: [], goalTitle: undefined },
};
