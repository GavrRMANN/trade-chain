import type { Meta, StoryObj } from '@storybook/react-vite';
import { MainSection } from './MainSection';

const meta = {
    title: 'Shared/MainSection',
    component: MainSection,
    args: {
        children: (
            <>
                <h2>Заголовок раздела</h2>
                <p>Содержимое основного раздела.</p>
            </>
        ),
    },
    decorators: [
        (Story) => (
            <div style={{ width: 600 }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof MainSection>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
