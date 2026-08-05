import { Button, Typography } from 'antd';

import './home-page.css';

export function HomePage() {
    return (
        <main className="home-page">
            <Typography.Title level={1}>Xakaton Avito</Typography.Title>
            <Typography.Paragraph>Frontend-приложение готово к разработке.</Typography.Paragraph>
            <Button type="primary">Начать</Button>
        </main>
    );
}
