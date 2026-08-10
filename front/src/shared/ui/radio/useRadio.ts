import type { ChangeEvent } from 'react';

import Styles from './Radio.module.css';

export const useRadio = ({
    error,
    onChange,
}: {
    error?: { showError: boolean };
    onChange?: (value: boolean) => void;
}) => {
    const radioClasses = [Styles.radio, error?.showError && Styles['radio--error']]
        .filter(Boolean)
        .join(' ');
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange?.(event.target.checked);

    return { radioClasses, handleChange };
};
