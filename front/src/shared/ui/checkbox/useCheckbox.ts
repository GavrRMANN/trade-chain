import type { ChangeEvent } from 'react';

import Styles from './Checkbox.module.css';

export const useCheckbox = ({
    error,
    onChange,
}: {
    error?: { showError: boolean };
    onChange?: (value: boolean) => void;
}) => {
    const checkboxClasses = [Styles.checkbox, error?.showError && Styles['checkbox--error']]
        .filter(Boolean)
        .join(' ');
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange?.(event.target.checked);

    return { checkboxClasses, handleChange };
};
