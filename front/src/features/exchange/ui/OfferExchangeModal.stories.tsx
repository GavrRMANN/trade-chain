import type { Meta, StoryObj } from '@storybook/react-vite';
import { Provider } from 'react-redux';
import { store } from '@app/redux';
import { OfferExchangeModal } from './OfferExchangeModal';

const meta = { title: 'Features/OfferExchangeModal', component: OfferExchangeModal, decorators: [(Story) => <Provider store={store}><Story /></Provider>], parameters: { layout: 'fullscreen' }, args: { isOpen: true, onClose: () => undefined, targetProductId: 'product-target', currentCustomerId: 'customer-1' } } satisfies Meta<typeof OfferExchangeModal>;
export default meta;
type Story = StoryObj<typeof meta>;
export const LoadingProducts: Story = {};
export const Closed: Story = { args: { isOpen: false } };
export const Guest: Story = { args: { currentCustomerId: undefined } };
