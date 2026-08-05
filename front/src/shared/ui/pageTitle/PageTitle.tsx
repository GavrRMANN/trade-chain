import Styles from './pageTitle.module.css';
import { memo } from 'react';

type TPageTitleProps = {
    title: string;
    subTitle?: string;
};

export const PageTitle = memo(({ title, subTitle }: TPageTitleProps) => {
    return (
        <div className={Styles.pageTitle}>
            <h1 className={Styles.title}>{title}</h1>

            {subTitle && <h3 className={Styles.subtitle}>{subTitle}</h3>}
        </div>
    );
});
