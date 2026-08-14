import type { ChangeEvent, FormEvent } from 'react';

import ControlStyles from '../control/Control.module.css';
import Styles from './SearchInput.module.css';

type TUseSearchInputParams = {
    value: string;
    disabled: boolean;
    loading: boolean;
    error?: { showError: boolean };
    onChange?: (value: string) => void;
    onSearch?: (value: string) => void;
};

export const useSearchInput = ({
    value,
    disabled,
    loading,
    error,
    onChange,
    onSearch,
}: TUseSearchInputParams) => {
    const inputClasses = [
        Styles.input,
        ControlStyles.text,
        disabled && Styles['input--disabled'],
        error?.showError && Styles['input--error'],
    ]
        .filter(Boolean)
        .join(' ');
    const buttonClasses = [
        Styles.btn,
        ControlStyles.text,
        (disabled || loading) && Styles['btn--disabled'],
        error?.showError && Styles['btn--error'],
    ]
        .filter(Boolean)
        .join(' ');
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange?.(event.target.value);
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        (onSearch ?? onChange)?.(value);
    };

    return { inputClasses, buttonClasses, handleChange, handleSubmit };
};
