import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProductCard } from './ProductCard';

const meta = {
    title: 'Entities/ProductCard',
    component: ProductCard,
    args: {
        title: 'Игровая приставка Sony PlayStation 4 Slim',
        img: 'https://50.img.avito.st/image/1/1.iedNrLa4JQ57G6cDU56eolkMJwjzDacYewAnDP0FLQT7._xzbVJNce46KNeP-4N3tbbh2TTVb5eNgmHDUYIyRsnU',
        price: 13990,
        location: 'Москва',
        onClick: () => console.log('onClick'),
    },
    decorators: [
        (Story) => (
            <div style={{ width: '320px' }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ProductCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoImage: Story = {
    args: {
        title: 'Игровая приставка Sony PlayStation 4 Slim',
        img: '',
        price: 13990,
        location: 'Москва',
    },
};
