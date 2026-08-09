import {type ChangeEvent, memo, type SubmitEvent} from "react";

import SearchSVG from '../../assets/icons/Search.svg?react';
import XMarkSVG from '../../assets/icons/X-mark.svg?react';
import Styles from "./SearchInput.module.css";
import ControlStyles from "../control/Control.module.css";
import {Spinner} from "../spinner";

type TError = {
    showError: boolean;
    errorMessage: string;
};

type TSearchInputProps = {
    value: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    onSearch?: (value: string) => void;
    error?: TError;
    disabled?: boolean;
    loading?: boolean;
    onFocus?: () => void;
    onClear?: () => void;
};

export const SearchInput = memo(({
                                     value = "",
                                     placeholder = "Искать",
                                     onChange,
                                     onSearch,
                                     error,
                                     disabled = false,
                                     loading = false,
                                     onFocus,
                                     onClear,
                                 }: TSearchInputProps) => {
    const inputClasses = [
        Styles['input'],
        ControlStyles['text'],
        disabled && Styles['input--disabled'],
        error?.showError && Styles['input--error']
    ].filter(Boolean).join(' ');

    const btnClasses = [
        Styles['btn'],
        ControlStyles['text'],
        (disabled || loading) && Styles['btn--disabled'],
        error?.showError && Styles['btn--error']
    ].filter(Boolean).join(' ');

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
    };

    const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (onSearch) {
            onSearch?.(value);
        } else {
            onChange?.(value);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={Styles['searchInput']} role={'search'}>
            {
                loading && <Spinner className={Styles['spinner']}/>
            }
            <input
                name={'input'}
                className={inputClasses}
                value={value}
                placeholder={placeholder}
                disabled={disabled}
                onChange={handleChange}
                onFocus={onFocus}
            />
            {value && onClear && (
                <button
                    aria-label="Очистить поиск"
                    type="button"
                    className={Styles.clear}
                    onClick={onClear}
                >
                    <XMarkSVG aria-hidden="true"/>
                </button>
            )}
            <button aria-label="Поиск" type="submit" className={btnClasses}>
                <SearchSVG className={Styles['icon']} aria-hidden="true"/>
            </button>
        </form>
    );
});

SearchInput.displayName = 'SearchInput';
