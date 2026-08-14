import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@app/redux';
import { ProductPage } from './ProductPage';

const meta = {
    title: 'Pages/ProductPage',
    component: ProductPage,
    decorators: [
        (Story) => (
            <Provider store={store}>
                <MemoryRouter initialEntries={['/product/product-1']}>
                    <Story />
                </MemoryRouter>
            </Provider>
        ),
    ],
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ProductPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
