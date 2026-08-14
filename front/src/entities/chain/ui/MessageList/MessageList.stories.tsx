import type { Meta, StoryObj } from '@storybook/react-vite';
import { MessageList } from './MessageList';
import type { TChainMessage } from '@entities/chain';

const messages: TChainMessage[] = [
    {
        message_id: '1',
        chain_id: '1',
        customer_id: 'me',
        body: 'Здравствуйте! Готовы обсудить обмен?',
        created_at: '2026-08-09T10:00:00Z',
    },
    {
        message_id: '2',
        chain_id: '1',
        customer_id: 'other',
        body: 'Да, давайте встретимся в центре.',
        created_at: '2026-08-09T10:05:00Z',
    },
];
const meta = {
    title: 'Entities/Chain/MessageList',
    component: MessageList,
    args: { currentCustomerId: 'me' },
} satisfies Meta<typeof MessageList>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Empty: Story = { args: { messages: [] } };
export const Conversation: Story = { args: { messages } };
export const IncomingOnly: Story = { args: { messages: [messages[1]] } };
