import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageTitle } from './PageTitle';

const meta = {
    title: 'Shared/PageTitle',
    component: PageTitle,
    args: { title: 'Мои объявления', subTitle: 'Управляйте опубликованными товарами' },
} satisfies Meta<typeof PageTitle>;
export default meta;
type Story = StoryObj<typeof meta>;
export const WithSubtitle: Story = {};
export const TitleOnly: Story = { args: { subTitle: undefined } };
