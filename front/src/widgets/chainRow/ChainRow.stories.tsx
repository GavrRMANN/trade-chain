import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChainRow, type TChainNode } from './ChainRow';

const product = (id: string, title: string) => ({ product_id: id, customer_id: 'customer-1', title, price: 12000, location: 'Москва', status: 'active' as const, created_at: '2026-08-01T10:00:00Z', updated_at: '2026-08-08T10:00:00Z' });
const nodes: TChainNode[] = [
    { product: product('product-1', 'Велосипед Merida'), isCurrent: true, isDone: true },
    { product: product('product-2', 'Игровая приставка'), isGoal: true },
];
const meta = { title: 'Widgets/ChainRow', component: ChainRow, args: { nodes } } satisfies Meta<typeof ChainRow>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Interactive: Story = { args: { onNodeClick: () => undefined } };
export const Empty: Story = { args: { nodes: [] } };
