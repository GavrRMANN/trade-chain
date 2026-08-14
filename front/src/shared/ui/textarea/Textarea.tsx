import { forwardRef } from 'react';
import { Label } from '../label';
import { useTextarea } from './useTextarea';

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
    disabled?: boolean;
    loading?: boolean;
    rows?: number;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TTextareaProps>(
    (
        {
            label,
            name,
            value = '',
            placeholder,
            onChange,
            error,
            disabled = false,
            loading = false,
            rows = 4,
        },
        ref,
    ) => {
        const { textareaClasses, handleChange } = useTextarea({
            disabled,
            error,
            loading,
            onChange,
        });

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
        );
    },
);

Textarea.displayName = 'Textarea';
