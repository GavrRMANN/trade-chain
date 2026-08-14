import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@app/redux';
import { AuthenticatedProfile } from './AuthenticatedProfile';

const user = {
    customer_id: 'customer-1',
    email: 'alexey@example.com',
    created_at: '2024-04-12T10:00:00Z',
};
const meta = {
    title: 'Pages/AuthenticatedProfile',
    component: AuthenticatedProfile,
    decorators: [
        (Story) => (
            <Provider store={store}>
                <MemoryRouter>
                    <Story />
                </MemoryRouter>
            </Provider>
        ),
    ],
    args: { user, isOwner: true, onLogout: () => undefined },
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AuthenticatedProfile>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Owner: Story = {};
export const Public: Story = { args: { isOwner: false, onLogout: undefined } };
