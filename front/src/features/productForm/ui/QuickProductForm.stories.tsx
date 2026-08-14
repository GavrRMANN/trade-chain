import type { Meta, StoryObj } from '@storybook/react-vite';

import { StoreProvider } from '@app/providers';

import { QuickProductForm } from './QuickProductForm';

const categories = [
    {
        category_id: 'sports',
        name: 'Спорт и отдых',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
    },
    {
        category_id: 'electronics',
        name: 'Электроника',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
    },
];

const meta = {
    title: 'Features/QuickProductForm',
    component: QuickProductForm,
    args: {
        categories,
        customerId: 'current-customer',
        onCreated: () => undefined,
        onCancel: () => undefined,
    },
    decorators: [
        (Story) => (
            <StoreProvider>
                <div style={{ width: '640px' }}>
                    <Story />
                </div>
            </StoreProvider>
        ),
    ],
} satisfies Meta<typeof QuickProductForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutCustomer: Story = {
    args: { customerId: undefined },
};
