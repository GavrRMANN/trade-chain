import {type Location, Outlet, useLocation} from 'react-router-dom';
import {HeaderMenu} from "@widgets/headerMenu";
import {Layout} from "antd";

import Styles from "./app.module.css";

const {Content} = Layout;

type TAppLayoutState = {
    backgroundLocation?: Location;
};

export const App = () => {
    const location = useLocation();
    const state = location.state as TAppLayoutState | null;
    const backgroundLocation = state?.backgroundLocation;

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
