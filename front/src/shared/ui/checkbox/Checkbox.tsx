import { forwardRef } from 'react';

import { Label } from '../label';
import { useCheckbox } from './useCheckbox';
import type { TFormError } from '@shared/lib/form';

type TCheckboxProps = {
    name?: string;
    label?: string;
    disabled?: boolean;
    error?: TFormError;
    checked: boolean;
    onChange?: (value: boolean) => void;
};

export const Checkbox = forwardRef<HTMLInputElement, TCheckboxProps>(
    ({ name, label, disabled = false, error, checked, onChange }, ref) => {
        const { checkboxClasses, handleChange } = useCheckbox({ error, onChange });

        return (
            <Label
                label={label}
                error={error}
                disabled={disabled}
                role={'checkbox'}
                aria-checked={checked}
            >
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
    },
);

Checkbox.displayName = 'Checkbox';
