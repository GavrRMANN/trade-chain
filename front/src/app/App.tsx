import { Outlet } from 'react-router-dom';
import { HeaderMenu } from '@widgets/headerMenu';
import { Layout } from 'antd';

import Styles from './app.module.css';
import { MobileNavBar } from '@widgets/mobileNavBar';
import { useIsMobile } from '@shared/lib';

const { Content } = Layout;

export const App = () => {
    const isMobile = useIsMobile();

    return (
        <Layout className={Styles['main-layout']}>
            <HeaderMenu />
            <Layout>
                {/* Заголовок экрана рисует сама страница через PageHeader:
                    он закрепляется при прокрутке и несёт контекст, который
                    знает только страница — цену, статус, главное действие. */}
                <Content className={Styles['content']}>
                    <Outlet />
                </Content>
            </Layout>
            {isMobile && <MobileNavBar />}
        </Layout>
    );
};
