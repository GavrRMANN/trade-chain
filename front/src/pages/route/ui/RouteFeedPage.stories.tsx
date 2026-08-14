import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import { store } from '@app/redux';

import { RouteFeedPage } from './RouteFeedPage';

const meta = {
    title: 'Pages/RouteFeedPage',
    component: RouteFeedPage,
    decorators: [
        (Story) => (
            <Provider store={store}>
                <MemoryRouter initialEntries={['/route/chain-1/feed']}>
                    <Story />
                </MemoryRouter>
            </Provider>
        ),
    ],
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof RouteFeedPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
