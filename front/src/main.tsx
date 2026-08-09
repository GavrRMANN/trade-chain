import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import 'antd/dist/reset.css';
import './index.css';

import { StoreProvider } from '@app/providers';
import { AppRouter } from '@app/router';
import {PageTitleProvider} from "@app/providers/pageTitle";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <StoreProvider>
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: '#1677ff',
                        colorBgLayout: '#ffffff'
                    },
                }}
            >
                <PageTitleProvider>
                    <BrowserRouter>
                        <AppRouter />
                    </BrowserRouter>
                </PageTitleProvider>
            </ConfigProvider>
        </StoreProvider>
    </StrictMode>,
);
