import type { Meta, StoryObj } from '@storybook/react-vite';
import { WhiteBox } from './WhiteBox';

const meta = {
    title: 'Shared/WhiteBox',
    component: WhiteBox,
    args: {
        title: 'Электроника',
    },
} satisfies Meta<typeof WhiteBox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Active: Story = {
    args: {
        active: true,
    },
};
export const Image: Story = {
    args: {
        img: 'https://i.pinimg.com/736x/05/68/c5/0568c500c59bad4b9da272e19cee57d5.jpg',
    },
};
export const Disabled: Story = {
    args: {
        disabled: true,
    },
};
