import Styles from './Button.module.css';

export const useButton = ({variant, active, loading, icon, className}: {
    variant: 'primary' | 'secondary' | 'text' | 'default';
    active: boolean;
    loading: boolean;
    icon: unknown;
    className?: string;
}) => ({
    className: [
        Styles.button,
        Styles[`button--${variant}`],
        className,
        active && Styles['button--active'],
        loading && Styles['button--loading'],
        icon && Styles['button--icon'],
    ].filter(Boolean).join(' '),
});
