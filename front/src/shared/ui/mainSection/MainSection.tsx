import Styles from './mainSection.module.css';
import type { ReactNode } from 'react';

type TMainSectionProps = {
    children: ReactNode;
};

export const MainSection = ({ children }: TMainSectionProps) => {
    return <section className={Styles.mainSection}>{children}</section>;
};
