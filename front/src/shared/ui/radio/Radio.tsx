import {forwardRef, type ChangeEvent} from "react";

import Styles from './Radio.module.css';

import {Label} from "../label";

type TError = {
    showError: boolean;
    errorMessage: string;
};

type TRadioProps = {
    name?: string;
    label?: string;
    disabled?: boolean;
    error?: TError;
    checked: boolean;
    onChange?: (value: boolean) => void;
};

export const Radio = forwardRef<HTMLInputElement, TRadioProps>(({
                                                                    name,
                                                                    label,
                                                                    disabled = false,
                                                                    error,
                                                                    checked,
                                                                    onChange
                                                                }, ref) => {
        const radioClasses = [
            Styles['radio'],
            error?.showError && Styles['radio--error']
        ].filter(Boolean).join(' ');

        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
            onChange?.(e.target.checked);
        };

        return (
            <Label
                label={label}
                disabled={disabled}
                error={error}
                position={'after'}
                role={'checkbox'}
                aria-checked={checked}
            >
                <input
                    ref={ref}
                    type="radio"
                    className={radioClasses}
                    disabled={disabled}
                    name={name}
                    checked={checked}
                    onChange={handleChange}
                    aria-invalid={Boolean(error)}
                />
            </Label>
        );
    }
);

Radio.displayName = "Radio";