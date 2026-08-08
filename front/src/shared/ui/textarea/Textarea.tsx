import {type ChangeEvent, forwardRef} from "react";
import ControlStyles from "../control/Control.module.css";
import Styles from "./Textarea.module.css";
import {Label} from "../label";

type TError = {
    showError: boolean;
    errorMessage: string;
};

type TTextareaProps = {
    label?: string;
    name?: string;
    value: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    error?: TError;
    disabled?: boolean,
    loading?: boolean,
    rows?: number,
}

export const Textarea = forwardRef<HTMLTextAreaElement, TTextareaProps>(({
                                                                              label,
                                                                              name,
                                                                              value = "",
                                                                              placeholder,
                                                                              onChange,
                                                                              error,
                                                                              disabled = false,
                                                                              loading = false,
                                                                              rows = 4,
                                                                          }, ref) => {
    const textareaClasses = [
        Styles['textarea'],
        ControlStyles['text'],
        (disabled || loading) && Styles['textarea--disabled'],
        error?.showError && Styles['textarea--error']
    ].filter(Boolean).join(' ');

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(e.target.value);
    };

    return (
        <Label label={label} error={error} disabled={disabled}>
            <textarea
                className={textareaClasses}
                value={value}
                name={name}
                placeholder={placeholder}
                rows={rows}
                disabled={disabled || loading}
                onChange={handleChange}
                ref={ref}
            />
        </Label>
    )
});

Textarea.displayName = "Textarea";
