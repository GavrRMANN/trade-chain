import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageError } from './pageError';

const meta = { title: 'Shared/PageError', component: PageError } satisfies Meta<typeof PageError>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: { message: 'Не удалось загрузить страницу' } };
