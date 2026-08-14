import type { Meta, StoryObj } from '@storybook/react-vite';

import type { TCategory } from '@entities/category';
import type { TProduct } from '@entities/product';

import { ArchivedProductView } from './ArchivedProductView';

const category: TCategory = {
    category_id: 'category-photo',
    name: 'Фототехника',
    icon: '📷',
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-01T10:00:00Z',
};

const product: TProduct = {
    product_id: 'product-camera',
    customer_id: 'customer-1',
    category_id: category.category_id,
    title: 'Плёночный фотоаппарат Olympus OM-10',
    description: 'Полностью рабочий фотоаппарат. Передан новому владельцу после успешного обмена.',
    image: 'https://images.unsplash.com/photo-1519638831568-d9897f54ed69?auto=format&fit=crop&w=1200&q=80',
    price: 15000,
    location: 'Москва',
    status: 'archived',
    created_at: '2026-06-12T10:00:00Z',
    updated_at: '2026-08-06T10:00:00Z',
};

const meta = {
    title: 'Pages/Product/ArchivedProductView',
    component: ArchivedProductView,
    args: {
        product,
        category,
        wishlistOptions: [
            { ...category, category_id: 'category-lenses', name: 'Объективы' },
            { ...category, category_id: 'category-audio', name: 'Аудиотехника' },
        ],
        sellerName: 'Алексей Смирнов',
        averageRating: 4.8,
        hasRating: true,
        ratingText: '4.8 · 12 отзывов',
    },
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ArchivedProductView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutWishlist: Story = {
    args: {
        wishlistOptions: [],
        hasRating: false,
        averageRating: undefined,
        ratingText: 'Нет отзывов',
    },
};
