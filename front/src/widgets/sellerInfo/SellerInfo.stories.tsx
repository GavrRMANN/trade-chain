import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { SellerInfo } from './SellerInfo';

const meta = { title: 'Widgets/SellerInfo', component: SellerInfo, decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>], args: { name: 'Алексей', meta: 'На сервисе 2 года' } } satisfies Meta<typeof SellerInfo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const WithoutProfileLink: Story = {};
export const WithProfileLink: Story = { args: { profileId: 'customer-1' } };
