import type { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { store } from '../redux';

export function StoreProvider({ children }: PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>;
}
