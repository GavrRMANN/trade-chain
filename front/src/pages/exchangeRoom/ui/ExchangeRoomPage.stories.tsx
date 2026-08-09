import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@app/redux';
import { ExchangeRoomPage } from './ExchangeRoomPage';

const meta = { title: 'Pages/ExchangeRoomPage', component: ExchangeRoomPage, decorators: [(Story) => <Provider store={store}><MemoryRouter initialEntries={['/exchanges/chain-1']}><Story /></MemoryRouter></Provider>], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof ExchangeRoomPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
