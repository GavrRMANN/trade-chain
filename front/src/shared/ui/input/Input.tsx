import {forwardRef} from "react";
import {Label} from "../label";
import {useInput} from './useInput';
import type {TFormError} from '@shared/lib/form';

type TInputProps = {
    label?: string;
    name?: string;
    type?: 'text' | 'email' | 'password';
    value: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    error?: TFormError;
    disabled?: boolean,
    loading?: boolean,
}

export const Input = forwardRef<HTMLInputElement, TInputProps>(({
                                                                    label,
                                                                    name,
                                                                    type = 'text',
                                                                    value = "",
                                                                    placeholder,
                                                                    onChange,
                                                                    error,
                                                                    disabled = false,
                                                                    loading = false
                                                                }, ref) => {
    const {inputClasses, handleChange} = useInput({disabled, error, loading, onChange});

    return (
        <Label label={label} error={error} disabled={disabled}>
            <input
                className={inputClasses}
                value={value}
                name={name}
                type={type}
                placeholder={placeholder}
                disabled={disabled || loading}
                onChange={handleChange}
                ref={ref}
            />
        </Label>
    )
});

Input.displayName = "Input";
