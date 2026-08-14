import { useSpinner } from './useSpinner';

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
    const { className: spinnerClassName } = useSpinner({ size, className });

    return <span className={spinnerClassName} role="status" aria-label={ariaLabel} />;
};
