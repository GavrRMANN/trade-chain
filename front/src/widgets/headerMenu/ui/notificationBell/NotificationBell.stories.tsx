import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@app/redux';
import { NotificationBell } from './NotificationBell';

const meta = {
    title: 'Widgets/NotificationBell',
    component: NotificationBell,
    decorators: [
        (Story) => (
            <Provider store={store}>
                <MemoryRouter>
                    <Story />
                </MemoryRouter>
            </Provider>
        ),
    ],
} satisfies Meta<typeof NotificationBell>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Compact: Story = { args: { compact: true } };
