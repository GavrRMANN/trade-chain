import type { ReactNode } from 'react';

import Styles from './layoutContainer.module.css';
import { useIsMobile } from '@/shared/lib/hooks';

type TContainerProps = {
    children: ReactNode;
    footer?: ReactNode;
    className?: string;
};

export const LayoutContainer = ({ children, footer, className = '' }: TContainerProps) => {
    const isMobile = useIsMobile();

    return (
        <div className={Styles.container}>
            {isMobile ? (
                <>
                    <div className={`${Styles.container__content} ${className}`}>{children}</div>
                    {footer}
                </>
            ) : (
                <div className={`${Styles.container__content} ${className}`}>
                    {children}
                    {footer}
                </div>
            )}
        </div>
    );
};
