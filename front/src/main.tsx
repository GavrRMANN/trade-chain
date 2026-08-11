import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import 'antd/dist/reset.css';
import './index.css';

import { RealtimeProvider, StoreProvider } from '@app/providers';
import { AppRouter } from '@app/router';
import {PageTitleProvider} from "@app/providers/pageTitle";
import { store } from '@app/redux';
import { initAuth } from '@entities/user';

// Гидрируем токен из localStorage в Redux до первого рендера,
// чтобы ProtectedRoute сразу знал об авторизации.
store.dispatch(initAuth());

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <StoreProvider>
            <RealtimeProvider>
                <ConfigProvider
                    theme={{
                        token: {
                            colorPrimary: '#00aaff',
                            colorBgLayout: '#ffffff',
                            colorText: '#000000',
                            colorTextSecondary: '#8c8c8c',
                            colorBorder: '#e7e6e4',
                            borderRadius: 12,
                            fontFamily:
                                "Manrope, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                        },
                    }}
                >
                    <PageTitleProvider>
                        <BrowserRouter>
                            <AppRouter />
                        </BrowserRouter>
                    </PageTitleProvider>
                </ConfigProvider>
            </RealtimeProvider>
        </StoreProvider>
    </StrictMode>,
);
