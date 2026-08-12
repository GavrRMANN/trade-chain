import { useRef, type ReactNode } from 'react';

import { useStuckHeader } from './useStuckHeader';
import Styles from './pageHeader.module.css';

type TPageHeaderProps = {
    /** Название экрана. Остаётся видимым на всей длине прокрутки. */
    title: string;
    /** Пояснение к экрану. Прячется, когда шапка прилипла, чтобы не есть высоту. */
    subTitle?: string;
    /** Ключевые факты страницы: цена, статус, счётчик. Видны всегда. */
    meta?: ReactNode;
    /** Главное действие экрана. */
    actions?: ReactNode;
    /** Переключатель разделов страницы. */
    tabs?: ReactNode;
    /**
     * Держать действия в строке заголовка и на телефоне.
     *
     * По умолчанию действие уезжает под заголовок во всю ширину — так удобнее
     * крупной кнопке вроде «Предложить обмен». Компактному управлению (например,
     * переключателю режима каталога) целая строка не нужна.
     */
    compactActions?: boolean;
};

/**
 * Закреплённая шапка страницы.
 *
 * Держит контекст экрана на виду при прокрутке: где пользователь находится,
 * с чем именно работает и какое действие здесь главное. Прилипает под
 * верхнюю панель приложения, поэтому смещение считается от --header-height.
 */
export const PageHeader = ({
    title,
    subTitle,
    meta,
    actions,
    tabs,
    compactActions = false,
}: TPageHeaderProps) => {
    const headerRef = useRef<HTMLElement>(null);
    const isStuck = useStuckHeader(headerRef);

    if (!title && !subTitle && !meta && !actions && !tabs) {
        return null;
    }

    const className = [Styles['page-header'], isStuck && Styles['page-header--stuck']]
        .filter(Boolean)
        .join(' ');

    return (
        <header ref={headerRef} className={className}>
            <div className={Styles['page-header__bar']}>
                <div className={Styles['page-header__titles']}>
                    {title && <h1 className={Styles['page-header__title']}>{title}</h1>}
                    {meta && <div className={Styles['page-header__meta']}>{meta}</div>}
                    {subTitle && <p className={Styles['page-header__subtitle']}>{subTitle}</p>}
                </div>

                {actions && (
                    <div
                        className={[
                            Styles['page-header__actions'],
                            compactActions && Styles['page-header__actions--compact'],
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        {actions}
                    </div>
                )}
            </div>

            {tabs && <div className={Styles['page-header__tabs']}>{tabs}</div>}
        </header>
    );
};
