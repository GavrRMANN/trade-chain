import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@app/redux';
import { NotificationsPage } from './NotificationsPage';

const meta = {
    title: 'Pages/NotificationsPage',
    component: NotificationsPage,
    decorators: [
        (Story) => (
            <Provider store={store}>
                <MemoryRouter>
                    <Story />
                </MemoryRouter>
            </Provider>
        ),
    ],
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NotificationsPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
