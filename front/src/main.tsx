import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router-dom';
import 'antd/dist/reset.css';
import './index.css';

import { StoreProvider } from '@app/providers';
import { browserRouting } from '@app/router';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <StoreProvider>
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: '#1677ff',
                    },
                }}
            >
                <RouterProvider router={browserRouting} />
            </ConfigProvider>
        </StoreProvider>
    </StrictMode>,
);
