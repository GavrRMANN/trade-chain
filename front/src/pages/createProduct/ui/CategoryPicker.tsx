import {useMemo, useState} from 'react';

import type {Category} from '@entities/category';

import Styles from './CategoryPicker.module.css';

type TCategoryPickerProps = {
    categories: Category[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    error?: {showError: boolean; errorMessage: string};
};

export const CategoryPicker = ({
    categories,
    value,
    onChange,
    disabled = false,
    error,
}: TCategoryPickerProps) => {
    const [expandedParent, setExpandedParent] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const roots = useMemo(
        () => categories.filter((category) => !category.parent_id),
        [categories],
    );

    const children = useMemo(
        () => categories.filter((category) => category.parent_id === expandedParent),
        [categories, expandedParent],
    );

    const searchResults = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) {
            return [];
        }
        return categories.filter((category) =>
            category.name.toLowerCase().includes(query),
        );
    }, [categories, search]);

    const selectedPath = useMemo(() => {
        if (!value) {
            return [];
        }
        const path = [];
        let current = categories.find((category) => category.category_id === value);
        const guard = new Set<string>();
        while (current && !guard.has(current.category_id)) {
            guard.add(current.category_id);
            path.unshift(current);
            current = current.parent_id
                ? categories.find((category) => category.category_id === current?.parent_id)
                : undefined;
        }
        return path;
    }, [categories, value]);

    const handleExpand = (parentId: string) => {
        if (disabled) {
            return;
        }
        setExpandedParent((current) => (current === parentId ? null : parentId));
    };

    const handleSelect = (category: Category) => {
        if (disabled) {
            return;
        }
        onChange(category.category_id);
        setExpandedParent(null);
        setSearch('');
    };

    const isSearching = search.trim().length > 0;

    return (
        <div className={Styles.picker}>
            <input
                className={Styles['picker__search']}
                type="text"
                placeholder="Поиск категории"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                disabled={disabled}
            />

            {isSearching ? (
                <div className={Styles['picker__column']}>
                    {searchResults.length === 0 && (
                        <p className={Styles['picker__empty']}>Ничего не найдено</p>
                    )}
                    <ul className={Styles['picker__list']}>
                        {searchResults.map((category) => (
                            <li key={category.category_id}>
                                <button
                                    type="button"
                                    className={[
                                        Styles['picker__item'],
                                        category.category_id === value && Styles['picker__item--active'],
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                    disabled={disabled}
                                    onClick={() => handleSelect(category)}
                                >
                                    {category.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className={Styles['picker__grid']}>
                    <div className={Styles['picker__column']}>
                        <p className={Styles['picker__column-title']}>Категория</p>
                        {roots.length === 0 && <p className={Styles['picker__empty']}>Категорий нет</p>}
                        <ul className={Styles['picker__list']}>
                            {roots.map((root) => (
                                <li key={root.category_id}>
                                    <button
                                        type="button"
                                        className={[
                                            Styles['picker__item'],
                                            root.category_id === value && Styles['picker__item--active'],
                                            root.category_id === expandedParent && Styles['picker__item--opened'],
                                        ]
                                            .filter(Boolean)
                                            .join(' ')}
                                        disabled={disabled}
                                        onClick={() => handleExpand(root.category_id)}
                                    >
                                        <span>{root.name}</span>
                                        {root.category_id === value && (
                                            <span className={Styles['picker__check']} aria-hidden="true">
                                                ✓
                                            </span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={Styles['picker__column']}>
                        <p className={Styles['picker__column-title']}>
                            {expandedParent
                                ? (categories.find((c) => c.category_id === expandedParent)?.name ?? 'Подкатегории')
                                : 'Подкатегория'}
                        </p>
                        {!expandedParent && (
                            <p className={Styles['picker__hint']}>Выберите категорию слева</p>
                        )}
                        {expandedParent && children.length === 0 && (
                            <button
                                type="button"
                                className={[
                                    Styles['picker__item'],
                                    expandedParent === value && Styles['picker__item--active'],
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                                disabled={disabled}
                                onClick={() =>
                                    handleSelect(
                                        categories.find((c) => c.category_id === expandedParent) as Category,
                                    )
                                }
                            >
                                Использовать эту категорию
                            </button>
                        )}
                        {expandedParent && children.length > 0 && (
                            <ul className={Styles['picker__list']}>
                                {children.map((child) => (
                                    <li key={child.category_id}>
                                        <button
                                            type="button"
                                            className={[
                                                Styles['picker__item'],
                                                child.category_id === value && Styles['picker__item--active'],
                                            ]
                                                .filter(Boolean)
                                            .join(' ')}
                                            disabled={disabled}
                                            onClick={() => handleSelect(child)}
                                        >
                                            <span>{child.name}</span>
                                            {child.category_id === value && (
                                                <span className={Styles['picker__check']} aria-hidden="true">
                                                    ✓
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {selectedPath.length > 0 && (
                <div className={Styles['picker__breadcrumb']} aria-label="Выбранная категория">
                    {selectedPath.map((category, index) => (
                        <span key={category.category_id} className={Styles['picker__breadcrumb-item']}>
                            {category.name}
                            {index < selectedPath.length - 1 && <span className={Styles['picker__sep']}>/</span>}
                        </span>
                    ))}
                </div>
            )}

            {error?.showError && <p className={Styles['picker__error-text']}>{error.errorMessage}</p>}
        </div>
    );
};
