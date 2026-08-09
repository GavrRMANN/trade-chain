import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageTitleProvider } from './PageTitleProvider';

const meta = { title: 'App/PageTitleProvider', component: PageTitleProvider, args: { children: <p>Страница с заголовком</p> } } satisfies Meta<typeof PageTitleProvider>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
