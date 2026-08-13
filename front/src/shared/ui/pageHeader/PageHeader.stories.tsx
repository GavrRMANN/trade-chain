import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../button';
import { PageHeader } from './PageHeader';

const meta = {
    title: 'Shared/PageHeader',
    component: PageHeader,
    args: { title: 'Мои объявления', subTitle: 'Управляйте опубликованными товарами' },
} satisfies Meta<typeof PageHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const WithSubtitle: Story = {};

export const TitleOnly: Story = { args: { subTitle: undefined } };

export const WithMetaAndAction: Story = {
    args: {
        title: 'Видеокарта GTX 1660 Super',
        subTitle: undefined,
        meta: (
            <>
                <strong>16 900 ₽</strong>
                <span>Активен</span>
                <span>Псков</span>
            </>
        ),
        actions: <Button>Предложить обмен</Button>,
    },
};

export const WithTabs: Story = {
    args: {
        title: 'Мои обмены',
        subTitle: undefined,
        tabs: (
            <>
                <Button variant="text">Цепочки обменов</Button>
                <Button variant="text">Все обмены</Button>
            </>
        ),
    },
};
