import type { Meta, StoryObj } from '@storybook/react-vite';
import { MobileHeaderMenu } from './MobileHeaderMenu';

const meta = { title: 'Widgets/MobileHeaderMenu', component: MobileHeaderMenu, args: { value: '', setValue: () => undefined, search: () => undefined, isLoading: false, isError: false, suggestions: [], selectSuggestion: () => undefined } } satisfies Meta<typeof MobileHeaderMenu>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Loading: Story = { args: { value: 'камера', isLoading: true } };
