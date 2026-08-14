import type { Meta, StoryObj } from '@storybook/react-vite';
import { BellIcon } from './BellIcon';

const meta = { title: 'Shared/BellIcon', component: BellIcon } satisfies Meta<typeof BellIcon>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
    render: () => (
        <div style={{ width: 32, height: 32 }}>
            <BellIcon className="storybook-bell" />
        </div>
    ),
};
