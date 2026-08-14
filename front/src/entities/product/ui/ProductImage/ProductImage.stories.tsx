import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProductImage } from './ProductImage';

const meta = {
    title: 'Shared/ProductImage',
    component: ProductImage,
    args: { alt: 'Велосипед', title: 'Велосипед' },
    decorators: [
        (Story) => (
            <div style={{ width: 240, height: 180 }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ProductImage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Placeholder: Story = {};
export const Image: Story = {
    args: { src: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=480' },
};
