import {forwardRef} from "react";
import {Label} from "../label";
import Styles from "./Switcher.module.css";
import {useSwitcher} from './useSwitcher';

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
        const {switcherClasses, handleChange} = useSwitcher({error, onChange});

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
