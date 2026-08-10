import { Button, Result } from 'antd';
import { Link } from 'react-router-dom';

import { useNotFoundPage } from '../lib';
import Styles from './notFound-page.module.css';

export const NotFoundPage = () => {
    const { backUrl } = useNotFoundPage();

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
