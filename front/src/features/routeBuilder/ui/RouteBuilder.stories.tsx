import type { Meta, StoryObj } from '@storybook/react-vite';
import { Provider } from 'react-redux';
import { store } from '@app/redux';
import { RouteBuilder } from './RouteBuilder';

const meta = { title: 'Features/RouteBuilder', component: RouteBuilder, decorators: [(Story) => <Provider store={store}><Story /></Provider>], args: { onCancel: () => undefined } } satisfies Meta<typeof RouteBuilder>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Card: Story = {};
export const Modal: Story = { args: { variant: 'modal' } };
