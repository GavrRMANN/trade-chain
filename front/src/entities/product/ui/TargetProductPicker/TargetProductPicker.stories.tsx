import type { Meta, StoryObj } from '@storybook/react-vite';

import { TargetProductPicker } from './TargetProductPicker';

const products = [
    {
        product_id: 'iphone-15',
        customer_id: 'seller-1',
        category_id: 'electronics',
        title: 'iPhone 15, 128 ГБ',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=480',
        price: 65000,
        location: 'Москва',
        status: 'active' as const,
        created_at: '2026-08-01T10:00:00Z',
        updated_at: '2026-08-08T10:00:00Z',
    },
    {
        product_id: 'sony-camera',
        customer_id: 'seller-2',
        category_id: 'electronics',
        title: 'Фотоаппарат Sony Alpha',
        price: 45000,
        location: 'Санкт-Петербург',
        status: 'active' as const,
        created_at: '2026-08-02T10:00:00Z',
        updated_at: '2026-08-09T10:00:00Z',
    },
];

const categories = [
    { category_id: 'electronics', name: 'Электроника' },
    { category_id: 'sports', name: 'Спорт и отдых' },
];

const meta = {
    title: 'Entities/Product/TargetProductPicker',
    component: TargetProductPicker,
    args: {
        products,
        categories,
        currentCustomerId: 'current-customer',
        onChange: () => undefined,
    },
    decorators: [
        (Story) => (
            <div style={{ width: '640px' }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof TargetProductPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ProductSearch: Story = {};

export const SelectedProduct: Story = {
    args: { value: { productId: 'iphone-15' } },
};

export const Loading: Story = {
    args: { isLoading: true },
};

export const Error: Story = {
    args: { isError: true },
};

export const Disabled: Story = {
    args: { disabled: true },
};
