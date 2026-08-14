import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { DesktopHeaderMenu } from './DesktopHeaderMenu';

const meta = {
    title: 'Widgets/DesktopHeaderMenu',
    component: DesktopHeaderMenu,
    decorators: [
        (Story) => (
            <MemoryRouter>
                <Story />
            </MemoryRouter>
        ),
    ],
    args: {
        value: '',
        setValue: () => undefined,
        search: () => undefined,
        isLoading: false,
        isError: false,
        suggestions: [],
        selectSuggestion: () => undefined,
    },
} satisfies Meta<typeof DesktopHeaderMenu>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Searching: Story = { args: { value: 'велосипед', isLoading: true } };
export const SearchError: Story = { args: { value: 'велосипед', isError: true } };
