import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'antd/dist/reset.css';

import { App } from './app/App';
import { StoreProvider } from './app/providers/StoreProvider';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <StoreProvider>
            <App />
        </StoreProvider>
    </StrictMode>,
);
