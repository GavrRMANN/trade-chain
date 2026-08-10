import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { StoreProvider } from '@app/providers';
import { HeaderMenu } from './HeaderMenu';

const meta = { title: 'Widgets/HeaderMenu', component: HeaderMenu, decorators: [(Story) => <StoreProvider><MemoryRouter><Story /></MemoryRouter></StoreProvider>], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof HeaderMenu>;
export default meta;
type Story = StoryObj<typeof meta>;
export const DesktopOrMobile: Story = {};
