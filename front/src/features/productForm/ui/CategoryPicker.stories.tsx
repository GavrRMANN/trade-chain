import type { Meta, StoryObj } from '@storybook/react-vite';
import { CategoryPicker } from './CategoryPicker';

const categories = [
    {
        category_id: 'transport',
        name: 'Транспорт',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
    },
    {
        category_id: 'bikes',
        name: 'Велосипеды',
        parent_id: 'transport',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
    },
    {
        category_id: 'electronics',
        name: 'Электроника',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
    },
];
const meta = {
    title: 'Features/CategoryPicker',
    component: CategoryPicker,
    args: { categories, value: '', onChange: () => undefined },
} satisfies Meta<typeof CategoryPicker>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Empty: Story = {};
export const Selected: Story = { args: { value: 'bikes' } };
export const Disabled: Story = { args: { disabled: true } };
export const Error: Story = {
    args: { error: { showError: true, errorMessage: 'Выберите категорию' } },
};
export const SearchNoResults: Story = {
    play: async ({ canvasElement }) => {
        const input = canvasElement.querySelector('input');
        input?.focus();
        input?.dispatchEvent(new Event('input', { bubbles: true }));
    },
};
