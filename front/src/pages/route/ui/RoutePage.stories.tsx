import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@app/redux';
import { RoutePage } from './RoutePage';

const meta = {
    title: 'Pages/RoutePage',
    component: RoutePage,
    decorators: [
        (Story) => (
            <Provider store={store}>
                <MemoryRouter initialEntries={['/route/chain-1']}>
                    <Story />
                </MemoryRouter>
            </Provider>
        ),
    ],
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof RoutePage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
