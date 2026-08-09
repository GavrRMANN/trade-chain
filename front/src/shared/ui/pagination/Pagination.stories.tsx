import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Pagination } from './Pagination';

const PaginationExample = () => {
    const [currentPage, setCurrentPage] = useState(3);

    return <Pagination currentPage={currentPage} total={10} onChange={setCurrentPage} />;
};

const meta = {
    title: 'Shared/Pagination',
    component: Pagination,
    args: { currentPage: 3, total: 10 },
} satisfies Meta<typeof Pagination>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <PaginationExample /> };
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true } };
