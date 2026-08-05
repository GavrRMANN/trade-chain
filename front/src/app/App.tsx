import {Outlet} from 'react-router-dom';
import {HeaderMenu} from "@widgets/headerMenu";
import {Layout} from "antd";

import Styles from "./app.module.css";

const {Content} = Layout;

export const App = () => {
    return (
        <Layout>
            <HeaderMenu/>
            <Layout>
                <Content
                    className={Styles.content}
                >
                    <Outlet/>
                </Content>
            </Layout>
        </Layout>
    );
};
