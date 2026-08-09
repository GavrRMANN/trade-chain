import {forwardRef, type LabelHTMLAttributes, type ReactNode} from "react";

import Styles from './Label.module.css';
import ControlStyles from '../control/Control.module.css';

type TError = {
    showError: boolean;
    errorMessage: string;
};

type TPosition = "before" | "after";

type TLabelPropsComp = {
    children: ReactNode;
    label?: string;
    position?: TPosition;
    disabled?: boolean;
    error?: TError;
}

type TLabelProps = LabelHTMLAttributes<HTMLLabelElement> & TLabelPropsComp;

const getLabelClassName = (disabled: boolean, active: boolean) => [
    Styles.label,
    active && Styles['label--active'],
    disabled && Styles['label--disabled'],
].filter(Boolean).join(' ');

const getTextClassName = (disabled: boolean) => [
    ControlStyles['text'],
    disabled && ControlStyles['text--disabled']
].filter(Boolean).join(' ');

export const Label = forwardRef<HTMLLabelElement, TLabelProps>(({
                                                                    children,
                                                                    label,
                                                                    position = 'before',
                                                                    disabled = false,
                                                                    error,
                                                                    ...props
                                                                }, ref) => {
    const labelClassName = getLabelClassName(disabled, !!label);
    const textClassName = getTextClassName(disabled);

    return (
        <label className={labelClassName} ref={ref} {...props}>
            {position === 'before' && label && (
                <span className={textClassName}>{label}</span>
            )}

            <div className={Styles['label__body']}>
                {children}
                {error?.showError && (
                    <span className={Styles['label__error-text']}>{error.errorMessage}</span>
                )}
            </div>

            {position === 'after' && label && (
                <span className={textClassName}>{label}</span>
            )}
        </label>
    );
});

Label.displayName = 'Label';