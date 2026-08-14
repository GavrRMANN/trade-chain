import type { ChangeEvent } from 'react';

import ControlStyles from '../control/Control.module.css';
import Styles from './Textarea.module.css';

export const useTextarea = ({
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
    const textareaClasses = [
        Styles.textarea,
        ControlStyles.text,
        (disabled || loading) && Styles['textarea--disabled'],
        error?.showError && Styles['textarea--error'],
    ]
        .filter(Boolean)
        .join(' ');

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
        onChange?.(event.target.value);

    return { textareaClasses, handleChange };
};
