import {forwardRef, useEffect, useMemo, useRef, useState} from "react";

import ArrowUp from '../../assets/icons/ArrowUp.svg?react';
import ArrowDown from '../../assets/icons/ArrowDown.svg?react';

import ControlStyles from '../control/Control.module.css';
import Styles from "./Selector.module.css";
import {Spinner} from "../spinner";
import {Label} from "../label";

type TError = {
    showError: boolean;
    errorMessage: string;
};

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
    error?: TError;
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
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const wrapperRef = useRef<HTMLLabelElement | null>(null);

    const selectedLabel = useMemo(
        () => options.find((opt) => opt.value === value)?.label || label || options[0]?.label,
        [label, options, value]
    );

    const selectorClasses = [
        Styles['selector'],
        ControlStyles['text'],
        isExpanded && Styles['selector--active'],
        (disabled || loading) && Styles['selector--disabled'],
        error?.showError && Styles['selector--error']
    ].filter(Boolean).join(' ');

    const btnClasses = [
        loading ? Styles['loading'] : Styles['arrow'],
    ].filter(Boolean).join(' ');

    const wrapperClasses = [
        Styles['wrapper'],
        ControlStyles['text'],
    ].filter(Boolean).join(' ');

    const textClasses = [
        ControlStyles['text'],
        (disabled || loading) && ControlStyles['text--disabled']
    ].filter(Boolean).join(' ');

    const onClick = () => {
        if (disabled || loading) {
            return;
        }

        setIsExpanded((prev) => !prev);
    };

    const onClickOption = (opt: TOption) => {
        onSelect?.(opt.value);

        setIsExpanded(false);
    };

    useEffect(() => {
        if (!isExpanded) {
            return;
        }

        const handleClick = (event: MouseEvent) => {
            const target = event.target;

            if (!(target instanceof Node)) {
                return;
            }

            if (!wrapperRef.current?.contains(target)) {
                setIsExpanded(false);
            }
        };

        document.addEventListener('mousedown', handleClick);

        return () => {
            document.removeEventListener('mousedown', handleClick);
        };
    }, [isExpanded]);

    return (
        <Label label={label} disabled={disabled} error={error} ref={wrapperRef}>
            <div
                ref={ref}
                tabIndex={disabled ? -1 : 0}
                className={selectorClasses}
                onClick={onClick}
                aria-invalid={Boolean(error)}
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={isExpanded}
                aria-disabled={disabled || loading}
            >
                <span className={textClasses}>
                    {selectedLabel}
                </span>
                <span className={btnClasses} aria-hidden="true">
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
                        {options
                            .filter((opt) => opt.value !== "")
                            .map((opt: TOption) => (
                                <li
                                    key={opt.value}
                                    className={`${Styles['wrapper__item']} ${opt.value === value && Styles['wrapper__item--active']}`}
                                    data-value={opt.value}
                                    onClick={() => onClickOption(opt)}
                                    role="option"
                                    aria-selected={opt.value === value}
                                >
                                    {opt.label}
                                </li>
                            ))}
                    </ul>
                )}
            </div>
        </Label>
    );
});

Selector.displayName = 'Selector';