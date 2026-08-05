import Styles from './Spinner.module.css';

type TSpinnerSize = 'sm' | 'md' | 'lg';

type TSpinnerProps = {
    size?: TSpinnerSize;
    className?: string;
    'aria-label'?: string;
};

/**
 * Отображает индикатор загрузки.
 * @param props Параметры индикатора загрузки.
 * @returns Компонент индикатора загрузки.
 */
export const Spinner = ({
                            size = 'md',
                            className,
                            'aria-label': ariaLabel = 'Загрузка',
                        }: TSpinnerProps) => {
    const classes = [
        Styles.spinner,
        Styles[`spinner--${size}`],
        className,
    ].filter(Boolean).join(' ');

    return (
        <span
            className={classes}
            role="status"
            aria-label={ariaLabel}
            aria-hidden="true"
        />
    );
};
