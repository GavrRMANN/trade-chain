import type { ChangeEvent } from 'react';

import ControlStyles from '../control/Control.module.css';
import Styles from './Input.module.css';

export const useInput = ({
    disabled,
    error,
    loading,
    onChange,
}: {
    disabled: boolean;
    error?: { showError: boolean };
    loading: boolean;
    onChange?: (value: string) => void;
}) => {
    const inputClasses = [
        Styles.input,
        ControlStyles.text,
        (disabled || loading) && Styles['input--disabled'],
        error?.showError && Styles['input--error'],
    ]
        .filter(Boolean)
        .join(' ');

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange?.(event.target.value);

    return { inputClasses, handleChange };
};
