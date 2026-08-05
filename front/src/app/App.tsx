import { ConfigProvider } from 'antd';

import { HomePage } from '../pages/home/ui/HomePage';

export function App() {
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#1677ff',
                },
            }}
        >
            <HomePage />
        </ConfigProvider>
    );
}
