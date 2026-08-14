import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { StoreProvider } from '@app/providers';
import { AuthForm } from './AuthForm';

const meta = {
    title: 'Features/AuthForm',
    component: AuthForm,
    decorators: [
        (Story) => (
            <StoreProvider>
                <MemoryRouter>
                    <Story />
                </MemoryRouter>
            </StoreProvider>
        ),
    ],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof AuthForm>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Login: Story = {};
