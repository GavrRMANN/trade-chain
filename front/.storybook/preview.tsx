import type { Preview } from '@storybook/react-vite';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import '../src/index.css';

const preview: Preview = {
    decorators: [
        (Story) => (
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: '#1677ff',
                        colorBgLayout: '#f9fafb',
                    },
                }}
            >
                <Story />
            </ConfigProvider>
        ),
    ],
    parameters: {
        layout: 'centered',
        controls: { expanded: true },
    },
};

export default preview;
