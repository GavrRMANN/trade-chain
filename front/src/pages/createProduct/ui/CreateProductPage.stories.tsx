import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@app/redux';
import { CreateProductPage } from './CreateProductPage';

const meta = {
    title: 'Pages/CreateProductPage',
    component: CreateProductPage,
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
} satisfies Meta<typeof CreateProductPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
