import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MainLayout } from './MainLayout';

const meta = {
    title: 'Shared/MainLayout',
    component: MainLayout,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof MainLayout>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <MemoryRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route index element={<div>Содержимое страницы</div>} />
                </Route>
            </Routes>
        </MemoryRouter>
    ),
};
