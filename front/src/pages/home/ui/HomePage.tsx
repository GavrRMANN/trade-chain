import { Button, Typography } from 'antd';

import Styles from './home-page.module.css';
import {MainSection} from "@shared/ui/mainSection";
import {PageTitle} from "@shared/ui/pageTitle";

export const HomePage = () => {
    return (
        <MainSection>
            <PageTitle title={'Xakaton Avito'}/>
            <div className={Styles.homePage}>
                <Typography.Paragraph>Frontend-приложение готово к разработке.</Typography.Paragraph>
                <Button type="primary">Начать</Button>
            </div>
        </MainSection>
    );
};
