import type { ChangeEvent } from 'react';

import Styles from './Switcher.module.css';

export const useSwitcher = ({
    error,
    onChange,
}: {
    error?: { showError: boolean };
    onChange?: (value: boolean) => void;
}) => {
    const switcherClasses = [Styles.switcher, error?.showError && Styles['switcher--error']]
        .filter(Boolean)
        .join(' ');
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange?.(event.target.checked);

    return { switcherClasses, handleChange };
};
