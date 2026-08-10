import type {TCategory} from '@entities/category';

import Styles from './CategoryPicker.module.css';
import {useCategoryPicker} from './useCategoryPicker';

type TCategoryPickerProps = {
    categories: TCategory[];
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
    const {
        expandedParent, search, setSearch, roots, children, searchResults, selectedPath,
        expandedParentName, isSearching, handleExpand, handleSelect,
        expandedParentCategory,
    } = useCategoryPicker(categories, value, disabled, onChange);

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
                            {expandedParentName}
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
                                onClick={() => expandedParentCategory && handleSelect(expandedParentCategory)}
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
