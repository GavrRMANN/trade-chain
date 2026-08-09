import {type ChangeEvent, forwardRef} from "react";
import {Label} from "../label";
import Styles from "./Switcher.module.css";

type TError = {
    showError: boolean;
    errorMessage: string;
};

type TSwitcherProps = {
    name?: string;
    label?: string;
    disabled?: boolean;
    error?: TError;
    checked: boolean;
    onChange?: (value: boolean) => void;
};

export const Switcher = forwardRef<HTMLInputElement, TSwitcherProps>(({
                                                                          name,
                                                                          label,
                                                                          disabled = false,
                                                                          error,
                                                                          checked,
                                                                          onChange
                                                                      }, ref) => {
        const switcherClasses = [
            Styles['switcher'],
            error?.showError && Styles['switcher--error']
        ].filter(Boolean).join(' ');

        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
            onChange?.(e.target.checked);
        };

        return (
            <Label label={label} error={error} disabled={disabled} role={'checkbox'} aria-checked={checked}>
                <input
                    ref={ref}
                    type="checkbox"
                    className={switcherClasses}
                    disabled={disabled}
                    name={name}
                    checked={checked}
                    onChange={handleChange}
                    aria-invalid={Boolean(error)}
                />
                <span className={Styles['track']}></span>
            </Label>
        );
    }
);

Switcher.displayName = 'Switcher';