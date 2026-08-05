import { Button, Typography } from 'antd';

import Styles from './home-page.module.css';

export const HomePage = () => {
    return (
        <div className={Styles.homePage}>
            <Typography.Title level={1}>Xakaton Avito</Typography.Title>
            <Typography.Paragraph>Frontend-приложение готово к разработке.</Typography.Paragraph>
            <Button type="primary">Начать</Button>
        </div>
    );
};
