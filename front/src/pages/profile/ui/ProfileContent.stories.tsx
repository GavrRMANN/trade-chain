import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@app/redux';
import { ProfileContent } from './ProfileContent';

const user = { customer_id: 'customer-1', email: 'alexey@example.com', created_at: '2024-04-12T10:00:00Z' };

const baseViewModel = {
    activeTab: 'products' as const,
    setActiveTab: () => undefined,
    products: [],
    reviews: [],
    exchanges: [],
    rating: 0,
    reviewsCount: 0,
    isProductsLoading: false,
    isProductsError: false,
    isReviewsLoading: false,
    isReviewsError: false,
    isExchangesLoading: false,
    isExchangesError: false,
    maskedName: 'alexey@example.com',
    getTabCount: () => 0,
    openProduct: () => undefined,
    openEditProduct: () => undefined,
    openExchange: () => undefined,
    openExchanges: () => undefined,
    openCreate: () => undefined,
};

const meta = {
    title: 'Pages/ProfileContent',
    component: ProfileContent,
    decorators: [
        (Story) => (
            <Provider store={store}>
                <MemoryRouter>
                    <Story />
                </MemoryRouter>
            </Provider>
        ),
    ],
    args: { user, isOwner: true, viewModel: baseViewModel },
} satisfies Meta<typeof ProfileContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyOwner: Story = {};
export const LoadingProducts: Story = { args: { viewModel: { ...baseViewModel, isProductsLoading: true } } };
export const ProductsError: Story = { args: { viewModel: { ...baseViewModel, isProductsError: true } } };
export const PublicProfile: Story = { args: { isOwner: false, viewModel: { ...baseViewModel, maskedName: 'al***@example.com' } } };
