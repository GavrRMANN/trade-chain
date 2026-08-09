import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState';

const meta = { title: 'Pages/EmptyState', component: EmptyState, args: { title: 'Товаров пока нет', description: 'Добавьте первое объявление, чтобы начать обмен.' } } satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;
export const WithoutAction: Story = {};
export const WithAction: Story = { args: { actionLabel: 'Добавить товар', onAction: () => undefined } };
