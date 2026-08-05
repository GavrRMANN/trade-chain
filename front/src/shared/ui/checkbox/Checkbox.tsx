import {forwardRef, type ChangeEvent} from "react";

import Styles from './Checkbox.module.css';
import {Label} from "../label";

type TError = {
    showError: boolean;
    errorMessage: string;
};

type TCheckboxProps = {
    name?: string;
    label?: string;
    disabled?: boolean;
    error?: TError;
    checked: boolean;
    onChange?: (value: boolean) => void;
};

export const Checkbox = forwardRef<HTMLInputElement, TCheckboxProps>(({
                                                                          name,
                                                                          label,
                                                                          disabled = false,
                                                                          error,
                                                                          checked,
                                                                          onChange
                                                                      }, ref) => {
        const checkboxClasses = [
            Styles['checkbox'],
            error?.showError && Styles['checkbox--error']
        ].filter(Boolean).join(' ');

        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
            onChange?.(e.target.checked);
        };

        return (
            <Label label={label} error={error} disabled={disabled} role={'checkbox'} aria-checked={checked}>
                <input
                    ref={ref}
                    type="checkbox"
                    className={checkboxClasses}
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

Checkbox.displayName = "Checkbox";