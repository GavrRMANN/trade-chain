import type { Meta, StoryObj } from '@storybook/react-vite';
import { NotificationRow } from './NotificationRow';

const base = { id: 'chain-1:incoming_offer', kind: 'incoming_offer' as const, chain_id: 'chain-1', title: 'Вам предложили обмен', body: 'Пользователь предлагает обменять свой товар.', status: 'pending' as const, updated_at: '2026-08-09T12:00:00Z', href: '/exchanges/chain-1' };
const meta = { title: 'Entities/NotificationRow', component: NotificationRow, args: { notification: base, onOpen: () => undefined } } satisfies Meta<typeof NotificationRow>;
export default meta;
type Story = StoryObj<typeof meta>;
export const IncomingOffer: Story = {};
export const OutgoingPending: Story = { args: { notification: { ...base, id: 'chain-1:outgoing_pending', kind: 'outgoing_pending', title: 'Предложение отправлено', status: 'pending' } } };
export const InProgress: Story = { args: { notification: { ...base, id: 'chain-1:in_progress', kind: 'in_progress', title: 'Обмен в работе', status: 'active' } } };
export const Finished: Story = { args: { notification: { ...base, id: 'chain-1:finished', kind: 'finished', title: 'Обмен завершён', status: 'completed' } } };
