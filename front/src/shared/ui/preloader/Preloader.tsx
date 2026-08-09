import { Spinner } from '../spinner';

import Styles from './preloader.module.css';

type TPreloaderProps = {
    message?: string;
};

export const Preloader = ({ message }: TPreloaderProps) => {
    return (
        <div className={Styles['preloader-block']}>
            <Spinner size="lg" className={Styles['preloader']} />
            <p>{message}</p>
        </div>
    );
};
