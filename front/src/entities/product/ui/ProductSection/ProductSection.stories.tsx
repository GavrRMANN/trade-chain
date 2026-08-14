import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProductSection } from './ProductSection';

const meta = {
    title: 'Shared/ProductSection',
    component: ProductSection,
    args: { title: 'Описание', children: <p>Хорошее состояние, использовался аккуратно.</p> },
} satisfies Meta<typeof ProductSection>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
