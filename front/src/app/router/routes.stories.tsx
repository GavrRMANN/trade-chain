import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { StoreProvider } from '@app/providers';
import { AppRouter } from './routes';

const meta = {
    title: 'App/AppRouter',
    component: AppRouter,
    decorators: [
        (Story) => (
            <StoreProvider>
                <MemoryRouter initialEntries={['/']}>
                    <Story />
                </MemoryRouter>
            </StoreProvider>
        ),
    ],
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppRouter>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Catalog: Story = {};
