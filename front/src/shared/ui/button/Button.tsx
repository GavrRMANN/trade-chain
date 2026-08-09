import Styles from './Button.module.css';
import {forwardRef, type MouseEventHandler, type ReactNode} from "react";
import {Spinner} from "../spinner";

type TButtonVariant = 'primary' | 'secondary' | 'text' | 'default';

type TButtonProps = {
    type?: 'button' | 'submit' | 'reset';
    children?: ReactNode;
    icon?: ReactNode;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    active?: boolean;
    disabled?: boolean;
    loading?: boolean;
    variant?: TButtonVariant;
    ariaLabel?: string;
    className?: string;
}

export const Button = forwardRef<HTMLButtonElement, TButtonProps>(({
                                                                       type,
                                                                       children,
                                                                       icon,
                                                                       onClick,
                                                                       active = false,
                                                                       disabled = false,
                                                                       loading = false,
                                                                       variant = 'primary',
                                                                       ariaLabel,
                                                                       className,
                                                                   }, ref) => {
    const classes = [
        Styles.button,
        Styles[`button--${variant}`],
        className,
        active && Styles[`button--active`],
        loading && Styles['button--loading'],
        icon && Styles['button--icon'],
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            ref={ref}
            disabled={disabled || loading}
            className={classes}
            onClick={onClick}
            aria-busy={loading}
            aria-label={ariaLabel}
        >
            {loading ? <Spinner/> : icon}
            {children}
        </button>
    );
});

Button.displayName = "Button";
