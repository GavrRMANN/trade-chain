import type { Meta, StoryObj } from '@storybook/react-vite';

import { RequiredAction } from './RequiredAction';

const meta = {
    title: 'Entities/Chain/RequiredAction',
    component: RequiredAction,
} satisfies Meta<typeof RequiredAction>;

export default meta;

type Story = StoryObj<typeof meta>;

export const YourAction: Story = {
    args: {
        action: {
            actor: 'you',
            text: 'Ответьте на предложение: принять или отклонить',
        },
    },
};

export const PartnerAction: Story = {
    args: {
        action: {
            actor: 'partner',
            text: 'Ждём подтверждения второго участника',
        },
    },
};
