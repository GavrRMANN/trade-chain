import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { StoreProvider } from '@app/providers';
import { AuthModal } from './AuthModal';

const meta = {
    title: 'Pages/AuthModal',
    component: AuthModal,
    decorators: [
        (Story) => (
            <StoreProvider>
                <MemoryRouter initialEntries={['/auth']}>
                    <Story />
                </MemoryRouter>
            </StoreProvider>
        ),
    ],
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AuthModal>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Open: Story = {};
