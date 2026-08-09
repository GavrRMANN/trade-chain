import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@app/redux';
import { CatalogPage } from './CatalogPage';

const meta = { title: 'Pages/CatalogPage', component: CatalogPage, decorators: [(Story) => <Provider store={store}><MemoryRouter><Story /></MemoryRouter></Provider>], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof CatalogPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
