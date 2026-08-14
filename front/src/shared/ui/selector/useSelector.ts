import { useEffect, useMemo, useReducer, useRef, useState } from 'react';

import ControlStyles from '../control/Control.module.css';
import Styles from './Selector.module.css';

type TOption = { value: string; label: string };

type TUseSelectorParams = {
    label?: string;
    value: string;
    options: TOption[];
    disabled: boolean;
    loading: boolean;
    error?: { showError: boolean };
    onSelect?: (value: string) => void;
};

/** Список длиннее этого — пролистать глазами уже сложнее, чем набрать пару букв. */
const SEARCH_THRESHOLD = 10;

/** Инкапсулирует состояние и взаимодействия выпадающего списка. */
export const useSelector = ({
    label,
    value,
    options,
    disabled,
    loading,
    error,
    onSelect,
}: TUseSelectorParams) => {
    const [state, dispatch] = useReducer(
        (currentState: { isExpanded: boolean }, action: { type: 'toggle' | 'collapse' }) => ({
            ...currentState,
            isExpanded: action.type === 'toggle' ? !currentState.isExpanded : false,
        }),
        { isExpanded: false },
    );
    const { isExpanded } = state;
    const wrapperRef = useRef<HTMLLabelElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const selectedLabel = useMemo(
        () => options.find((option) => option.value === value)?.label || label || options[0]?.label,
        [label, options, value],
    );
    const selectableOptions = useMemo(
        () => options.filter((option) => option.value !== ''),
        [options],
    );
    const isSearchable = selectableOptions.length > SEARCH_THRESHOLD;
    const visibleOptions = useMemo(() => {
        if (!isSearchable || !searchQuery.trim()) {
            return selectableOptions;
        }
        const query = searchQuery.trim().toLowerCase();
        return selectableOptions.filter((option) => option.label.toLowerCase().includes(query));
    }, [selectableOptions, isSearchable, searchQuery]);
    const selectorClasses = [
        Styles.selector,
        ControlStyles.text,
        isExpanded && Styles['selector--active'],
        (disabled || loading) && Styles['selector--disabled'],
        error?.showError && Styles['selector--error'],
    ]
        .filter(Boolean)
        .join(' ');
    const buttonClasses = [loading ? Styles.loading : Styles.arrow].filter(Boolean).join(' ');
    const wrapperClasses = [Styles.wrapper, ControlStyles.text].filter(Boolean).join(' ');
    const textClasses = [
        ControlStyles.text,
        (disabled || loading) && ControlStyles['text--disabled'],
    ]
        .filter(Boolean)
        .join(' ');
    const toggle = () => {
        if (!disabled && !loading) {
            dispatch({ type: 'toggle' });
        }
    };
    const selectOption = (option: TOption) => {
        onSelect?.(option.value);
        dispatch({ type: 'collapse' });
    };

    useEffect(() => {
        if (!isExpanded) {
            return;
        }
        const handleDocumentClick = (event: MouseEvent) => {
            if (event.target instanceof Node && !wrapperRef.current?.contains(event.target)) {
                dispatch({ type: 'collapse' });
            }
        };
        document.addEventListener('mousedown', handleDocumentClick);
        return () => document.removeEventListener('mousedown', handleDocumentClick);
    }, [isExpanded]);

    /* Запрос — состояние конкретного открытия списка: следующий раз он должен
       начинаться с чистого поля, а не с прошлого фильтра. */
    useEffect(() => {
        if (!isExpanded) {
            setSearchQuery('');
        }
    }, [isExpanded]);

    useEffect(() => {
        if (isExpanded && isSearchable) {
            searchInputRef.current?.focus();
        }
    }, [isExpanded, isSearchable]);

    return {
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
    };
};
