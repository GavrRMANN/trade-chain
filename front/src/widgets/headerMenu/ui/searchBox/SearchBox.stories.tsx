import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchBox } from './SearchBox';

const meta = { title: 'Widgets/SearchBox', component: SearchBox, args: { value: 'велосипед', setValue: () => undefined, search: () => undefined, isLoading: false, isError: false, suggestions: [{ id: 'p1', type: 'product', label: 'Велосипед Merida' }, { id: 'c1', type: 'category', label: 'Велосипеды' }], selectSuggestion: () => undefined } } satisfies Meta<typeof SearchBox>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Suggestions: Story = {};
export const Loading: Story = { args: { isLoading: true } };
export const Empty: Story = { args: { suggestions: [] } };
export const Error: Story = { args: { isError: true } };
