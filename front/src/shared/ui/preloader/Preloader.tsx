import { Spin } from 'antd';

import Styles from './preloader.module.css';

type TPreloaderProps = {
    message?: string;
};

export const Preloader = ({ message }: TPreloaderProps) => {
    return (
        <div className={Styles['preloader-block']}>
            <Spin className={Styles['preloader']} />
            <p>{message}</p>
        </div>
    );
};
