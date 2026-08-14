import type { Meta, StoryObj } from '@storybook/react-vite';
import { StoreProvider } from './StoreProvider';

const meta = {
    title: 'App/StoreProvider',
    component: StoreProvider,
    args: { children: <p>Компонент внутри Redux Provider</p> },
} satisfies Meta<typeof StoreProvider>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
