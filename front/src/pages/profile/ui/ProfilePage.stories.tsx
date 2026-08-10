import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@app/redux';
import { ProfilePage } from './ProfilePage';

const meta = { title: 'Pages/ProfilePage', component: ProfilePage, decorators: [(Story) => <Provider store={store}><MemoryRouter initialEntries={['/profile']}><Story /></MemoryRouter></Provider>], parameters: { layout: 'fullscreen' } } satisfies Meta<typeof ProfilePage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
