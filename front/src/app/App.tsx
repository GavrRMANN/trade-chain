import { Outlet } from 'react-router-dom';
import { HeaderMenu } from '@widgets/headerMenu';
import { Layout } from 'antd';

import Styles from './app.module.css';
import { usePageTitle } from '@app/providers/pageTitle';
import { PageTitle } from '@shared/ui/pageTitle';
import { MobileNavBar } from '@widgets/mobileNavBar';
import { useIsMobile } from '@shared/lib';

const { Content } = Layout;

export const App = () => {
    const { title, subTitle } = usePageTitle();
    const isMobile = useIsMobile();

    return (
        <Layout className={Styles['main-layout']}>
            <HeaderMenu />
            <Layout>
                <Content className={Styles['content']}>
                    <PageTitle title={title} subTitle={subTitle} />
                    <Outlet />
                </Content>
            </Layout>
            {isMobile && <MobileNavBar />}
        </Layout>
    );
};
