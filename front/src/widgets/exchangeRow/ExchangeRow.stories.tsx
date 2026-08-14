import type { Meta, StoryObj } from '@storybook/react-vite';
import { Provider } from 'react-redux';
import { store } from '@app/redux';
import { ExchangeRow, type TExchangeRowData } from './ExchangeRow';

const product = (id: string, title: string) => ({
    product_id: id,
    customer_id: 'customer-1',
    title,
    price: 12000,
    location: 'Москва',
    status: 'active' as const,
    created_at: '2026-08-01T10:00:00Z',
    updated_at: '2026-08-08T10:00:00Z',
});
const row: TExchangeRowData = {
    chain: {
        chain_id: 'chain-1',
        from_product_id: 'product-1',
        to_product_id: 'product-2',
        initiator_id: 'customer-1',
        status: 'active',
        message: 'Давайте встретимся в центре.',
        created_at: '2026-08-08T10:00:00Z',
        updated_at: '2026-08-08T10:00:00Z',
    },
    fromProduct: product('product-1', 'Велосипед'),
    toProduct: product('product-2', 'Приставка'),
    goalProduct: product('goal-1', 'Ноутбук'),
};
const meta = {
    title: 'Widgets/ExchangeRow',
    component: ExchangeRow,
    decorators: [
        (Story) => (
            <Provider store={store}>
                <Story />
            </Provider>
        ),
    ],
    args: { row },
} satisfies Meta<typeof ExchangeRow>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Active: Story = {};
export const ReadOnly: Story = { args: { onOpen: undefined } };
export const MissingProduct: Story = {
    args: { row: { ...row, toProduct: undefined, goalProduct: undefined } },
};
