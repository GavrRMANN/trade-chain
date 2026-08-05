import { Button, Result } from 'antd';
import { Link, useLocation } from 'react-router-dom';

import Styles from './notFound-page.module.css';

export const NotFoundPage = () => {
    const location = useLocation();
    const backUrl = location.state?.backUrl;

    return (
        <div className={Styles.page}>
            <Result status="404" title="Страница не найдена" />
            <div className={Styles['btn-block']}>
                <Button type="primary">
                    <Link to="/">Вернуться на главную</Link>
                </Button>
                {backUrl && (
                    <Button>
                        <Link to={backUrl}>Назад</Link>
                    </Button>
                )}
            </div>
        </div>
    );
};
