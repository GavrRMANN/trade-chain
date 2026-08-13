import {forwardRef} from "react";

import ArrowUp from '../../assets/icons/ArrowUp.svg?react';
import ArrowDown from '../../assets/icons/ArrowDown.svg?react';

import Styles from "./Selector.module.css";
import {Spinner} from "../spinner";
import {Label} from "../label";
import {useSelector} from './useSelector';
import type {TFormError} from '@shared/lib/form';

type TOption = {
    value: string;
    label: string;
}

type TSelectorProps = {
    name?: string;
    value: string;
    label?: string;
    options: TOption[];
    onSelect?: (value: string) => void;
    error?: TFormError;
    disabled?: boolean,
    loading?: boolean,
}

export const Selector = forwardRef<HTMLDivElement, TSelectorProps>(({
                                                                        label,
                                                                        value = "",
                                                                        name,
                                                                        options,
                                                                        onSelect,
                                                                        error,
                                                                        disabled = false,
                                                                        loading = false
                                                                    }, ref) => {
    const {
        isExpanded,
        wrapperRef,
        searchInputRef,
        selectedLabel,
        selectorClasses,
        buttonClasses,
        wrapperClasses,
        textClasses,
        isSearchable,
        searchQuery,
        setSearchQuery,
        visibleOptions,
        toggle,
        selectOption,
    } = useSelector({
        label, value, options, disabled, loading, error, onSelect,
    });

    return (
        <Label label={label} disabled={disabled} error={error} ref={wrapperRef}>
            <div
                ref={ref}
                tabIndex={disabled ? -1 : 0}
                className={selectorClasses}
                onClick={toggle}
                aria-invalid={Boolean(error)}
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={isExpanded}
                aria-disabled={disabled || loading}
            >
                <span className={textClasses}>
                    {selectedLabel}
                </span>
                <span className={buttonClasses} aria-hidden="true">
                    {loading ?
                        <Spinner size={'sm'}/>
                        :
                        isExpanded ? <ArrowUp/> : <ArrowDown/>
                    }
                </span>
                {name && (
                    <input
                        type="hidden"
                        name={name}
                        value={value}
                        readOnly
                        disabled={disabled}
                    />
                )}
                {isExpanded && (
                    <ul className={wrapperClasses} role="listbox">
                        {isSearchable && (
                            <li className={Styles['wrapper__search']} role="presentation">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    className={Styles['wrapper__search-input']}
                                    placeholder="Поиск..."
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    onClick={(event) => event.stopPropagation()}
                                    onKeyDown={(event) => event.stopPropagation()}
                                />
                            </li>
                        )}
                        {visibleOptions.length > 0 ? (
                            visibleOptions.map((opt: TOption) => (
                                <li
                                    key={opt.value}
                                    className={`${Styles['wrapper__item']} ${opt.value === value && Styles['wrapper__item--active']}`}
                                    data-value={opt.value}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        selectOption(opt);
                                    }}
                                    role="option"
                                    aria-selected={opt.value === value}
                                >
                                    {opt.label}
                                </li>
                            ))
                        ) : (
                            <li className={Styles['wrapper__empty']} role="presentation">
                                Ничего не найдено
                            </li>
                        )}
                    </ul>
                )}
            </div>
        </Label>
    );
});

Selector.displayName = 'Selector';
