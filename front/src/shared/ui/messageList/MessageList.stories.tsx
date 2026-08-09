import type { Meta, StoryObj } from '@storybook/react-vite';
import { MessageList, type TMessage } from './MessageList';

const messages: TMessage[] = [
    { message_id: '1', customer_id: 'me', body: 'Здравствуйте! Готовы обсудить обмен?', created_at: '2026-08-09T10:00:00Z' },
    { message_id: '2', customer_id: 'other', body: 'Да, давайте встретимся в центре.', created_at: '2026-08-09T10:05:00Z' },
];
const meta = { title: 'Shared/MessageList', component: MessageList, args: { currentCustomerId: 'me' } } satisfies Meta<typeof MessageList>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Empty: Story = { args: { messages: [] } };
export const Conversation: Story = { args: { messages } };
export const IncomingOnly: Story = { args: { messages: [messages[1]] } };
