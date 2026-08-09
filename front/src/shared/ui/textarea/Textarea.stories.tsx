import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './Textarea';

const meta = { title: 'Shared/Textarea', component: Textarea, args: { label: 'Описание', value: 'Текст объявления', placeholder: 'Введите описание' } } satisfies Meta<typeof Textarea>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = { args: { value: '' } };
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true } };
export const Error: Story = { args: { value: '', error: { showError: true, errorMessage: 'Добавьте описание' } } };
