import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { ViewModeToggle } from './ViewModeToggle';

const meta = {
    title: 'Shared/ViewModeToggle',
    component: ViewModeToggle,
} satisfies Meta<typeof ViewModeToggle<string>>;
export default meta;
type Story = StoryObj<typeof meta>;

const Demo = () => {
    const [mode, setMode] = useState('feed');

    return (
        <ViewModeToggle
            ariaLabel="Режим просмотра каталога"
            value={mode}
            onChange={setMode}
            options={[
                { value: 'feed', label: 'Лента' },
                { value: 'grid', label: 'Сетка' },
            ]}
        />
    );
};

export const Default: Story = {
    args: {
        ariaLabel: 'Режим просмотра каталога',
        value: 'feed',
        onChange: () => {},
        options: [
            { value: 'feed', label: 'Лента' },
            { value: 'grid', label: 'Сетка' },
        ],
    },
    render: () => <Demo />,
};
