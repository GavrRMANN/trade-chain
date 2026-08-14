import type { Meta, StoryObj } from '@storybook/react-vite';

import { StoreProvider } from '@app/providers';

import { CustomerRecommendationsEditor } from './CustomerRecommendationsEditor';

const meta = {
    title: 'Features/CustomerRecommendationsEditor',
    component: CustomerRecommendationsEditor,
    decorators: [
        (Story) => (
            <StoreProvider>
                <div style={{ width: '640px' }}>
                    <Story />
                </div>
            </StoreProvider>
        ),
    ],
} satisfies Meta<typeof CustomerRecommendationsEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
