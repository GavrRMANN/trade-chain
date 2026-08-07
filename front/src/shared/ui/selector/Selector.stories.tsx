import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Selector } from './Selector';

const options = [
    { value: 'all', label: 'Все категории' },
    { value: 'transport', label: 'Транспорт' },
    { value: 'electronics', label: 'Электроника' },
];

const SelectorExample = () => {
    const [value, setValue] = useState('all');

    return <Selector label="Категория" value={value} options={options} onSelect={setValue} />;
};

const meta = {
    title: 'Shared/Selector',
    component: Selector,
    args: { value: 'all', options },
} satisfies Meta<typeof Selector>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <SelectorExample /> };
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true } };
