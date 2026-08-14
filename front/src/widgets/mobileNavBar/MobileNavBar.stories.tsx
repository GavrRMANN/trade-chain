import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { MobileNavBar } from './mobileNavBar';

const meta = {
    title: 'Widgets/MobileNavBar',
    component: MobileNavBar,
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={['/']}>
                <Story />
            </MemoryRouter>
        ),
    ],
    parameters: { viewport: { defaultViewport: 'mobile1' }, layout: 'fullscreen' },
} satisfies Meta<typeof MobileNavBar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Home: Story = {};
export const ProfileActive: Story = {
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={['/profile']}>
                <Story />
            </MemoryRouter>
        ),
    ],
};
