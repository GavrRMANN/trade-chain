import type { ReactNode } from 'react';
import Styles from './product-section.module.css';

type TProductSectionProps = { title: string; children: ReactNode };

export const ProductSection = ({ title, children }: TProductSectionProps) => (
    <section className={Styles.section}>
        <h2>{title}</h2>
        {children}
    </section>
);
