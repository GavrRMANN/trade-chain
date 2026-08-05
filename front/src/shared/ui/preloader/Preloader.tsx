import { Spin } from 'antd';

import Styles from './preloader.module.css';

export const Preloader = () => {
    return <Spin className={Styles.preloader} />;
};
