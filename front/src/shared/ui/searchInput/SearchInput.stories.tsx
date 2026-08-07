import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SearchInput } from './SearchInput';

const SearchInputExample = () => {
    const [value, setValue] = useState('Велосипед');

    return (
        <SearchInput
            value={value}
            onChange={setValue}
            onSearch={(query) => console.info('Поиск:', query)}
        />
    );
};

const meta = { title: 'Shared/SearchInput', component: SearchInput } satisfies Meta<
    typeof SearchInput
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: { value: 'Велосипед' },
    render: () => <SearchInputExample />,
};
export const Disabled: Story = { args: { value: 'Велосипед', disabled: true } };
export const Loading: Story = { args: { value: 'Велосипед', loading: true } };
