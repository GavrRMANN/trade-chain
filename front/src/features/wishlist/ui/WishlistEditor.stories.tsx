import type { Meta, StoryObj } from '@storybook/react-vite';
import { Provider } from 'react-redux';
import { store } from '@app/redux';
import { WishlistEditor } from './WishlistEditor';

const options = [{ category_id: 'electronics', name: 'Электроника', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' }];
const wishlist = { wishlist_id: 'wishlist-1', product_id: 'product-1', name: 'Хочу взамен', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' };
const meta = { title: 'Features/WishlistEditor', component: WishlistEditor, decorators: [(Story) => <Provider store={store}><Story /></Provider>], args: { productId: 'product-1', productTitle: 'Велосипед', wishlist, options } } satisfies Meta<typeof WishlistEditor>;
export default meta;
type Story = StoryObj<typeof meta>;
export const WithOptions: Story = {};
export const Empty: Story = { args: { wishlist: undefined, options: [] } };
