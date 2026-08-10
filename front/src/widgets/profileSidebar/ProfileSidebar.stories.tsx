import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProfileSidebar } from './ProfileSidebar';

const meta = { title: 'Widgets/ProfileSidebar', component: ProfileSidebar, args: { name: 'Алексей', createdAt: '2024-04-12T10:00:00Z', rating: 4.8, reviewsCount: 12, productsCount: 7, exchangesCount: 3, onReviewsClick: () => undefined } } satisfies Meta<typeof ProfileSidebar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const WithStats: Story = {};
export const Owner: Story = { args: { onLogout: () => undefined } };
export const WithoutExchanges: Story = { args: { exchangesCount: undefined, reviewsCount: 0, productsCount: 1 } };
