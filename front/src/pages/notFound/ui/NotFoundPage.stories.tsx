import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { NotFoundPage } from './NotFoundPage';

const meta = { title: 'Pages/NotFoundPage', component: NotFoundPage, decorators: [(Story) => <MemoryRouter initialEntries={['/missing']}><Story /></MemoryRouter>], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof NotFoundPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const WithoutBackLink: Story = {};
export const WithBackLink: Story = { decorators: [(Story) => <MemoryRouter initialEntries={[{ pathname: '/missing', state: { backUrl: '/catalog' } }]}><Story /></MemoryRouter>] };
