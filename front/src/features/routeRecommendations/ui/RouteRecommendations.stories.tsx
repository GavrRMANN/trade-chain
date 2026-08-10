import type { Meta, StoryObj } from '@storybook/react-vite';
import { RouteRecommendations } from './RouteRecommendations';

const item = (id: string, title: string) => ({ product: { product_id: id, customer_id: 'customer-1', title, price: 25000, location: 'Москва', status: 'active' as const, created_at: '2026-08-01T10:00:00Z', updated_at: '2026-08-08T10:00:00Z' } });
const meta = { title: 'Features/RouteRecommendations', component: RouteRecommendations, args: { items: [item('p1', 'Ноутбук'), item('p2', 'Камера')], selectedIds: [], isSubmitting: false, onToggle: () => undefined, onSubmit: () => undefined, onOpenProduct: () => undefined, onOpenOffer: () => undefined } } satisfies Meta<typeof RouteRecommendations>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Available: Story = {};
export const Selected: Story = { args: { selectedIds: ['p1'] } };
export const Submitting: Story = { args: { selectedIds: ['p1'], isSubmitting: true } };
export const Empty: Story = { args: { items: [] } };
