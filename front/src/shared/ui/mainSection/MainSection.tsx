import Styles from './mainSection.module.css';
import type { ReactNode } from 'react';

type TMainSectionProps = {
    children: ReactNode;
    fill?: boolean;
};

export const MainSection = ({ children, fill = false }: TMainSectionProps) => {
    const className = [
        Styles.mainSection,
        fill && Styles['mainSection--fill'],
    ].filter(Boolean).join(' ');

    return <section className={className}>{children}</section>;
};
