import {memo} from "react";

import SearchSVG from '../../assets/icons/Search.svg?react';
import XMarkSVG from '../../assets/icons/X-mark.svg?react';
import Styles from "./SearchInput.module.css";
import {Spinner} from "../spinner";
import {useSearchInput} from './useSearchInput';
import type {TFormError} from '@shared/lib/form';

type TSearchInputProps = {
    value: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    onSearch?: (value: string) => void;
    error?: TFormError;
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
    const {inputClasses, buttonClasses, handleChange, handleSubmit} = useSearchInput({
        value, disabled, loading, error, onChange, onSearch,
    });

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
            <button aria-label="Поиск" type="submit" className={buttonClasses}>
                <SearchSVG className={Styles['icon']} aria-hidden="true"/>
            </button>
        </form>
    );
});

SearchInput.displayName = 'SearchInput';
