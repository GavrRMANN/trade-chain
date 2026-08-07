import {Outlet} from 'react-router-dom';
import {HeaderMenu} from "@widgets/headerMenu";
import {Layout} from "antd";

import Styles from "./app.module.css";
import {usePageTitle} from "@app/providers/pageTitle";
import {PageTitle} from "@shared/ui/pageTitle";

const {Content} = Layout;

export const App = () => {
    const {title} = usePageTitle();

    return (
        <Layout className={Styles['main-layout']}>
            <HeaderMenu/>
            <Layout>
                <Content
                    className={Styles.content}
                >
                    <PageTitle title={title}/>
                    <Outlet/>
                </Content>
            </Layout>
        </Layout>
    );
};
