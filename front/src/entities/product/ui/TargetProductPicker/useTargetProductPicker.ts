import { useDeferredValue, useMemo, useState } from 'react';

import type { TProduct, TTargetGoal } from '../../types';

export type { TTargetGoal };

export type TGoalSearchMode = 'product' | 'category';

type TUseTargetProductPickerParams = {
    products: TProduct[];
    currentCustomerId: string;
    onSelect: (goal: TTargetGoal) => void;
};

/** Управляет фильтрами и выбором целевого товара или категории для обмена. */
export const useTargetProductPicker = ({
    products,
    currentCustomerId,
    onSelect,
}: TUseTargetProductPickerParams) => {
    const [searchMode, setSearchMode] = useState<TGoalSearchMode>('product');
    const [searchValue, setSearchValue] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const deferredSearch = useDeferredValue(searchValue.trim());

    const targetProducts = useMemo(() => {
        const normalizedSearch = deferredSearch.toLocaleLowerCase('ru');

        return products
            .filter((product) => {
                const matchesCategory = !categoryId || product.category_id === categoryId;
                const matchesSearch =
                    !normalizedSearch ||
                    product.title.toLocaleLowerCase('ru').includes(normalizedSearch);

                return (
                    product.status === 'active' &&
                    product.customer_id !== currentCustomerId &&
                    (searchMode === 'product' ? matchesSearch : matchesCategory)
                );
            })
            .slice(0, 8);
    }, [categoryId, currentCustomerId, deferredSearch, products, searchMode]);

    const selectMode = (mode: TGoalSearchMode) => {
        setSearchMode(mode);
        setSearchValue('');
        setCategoryId('');
        setSelectedCategoryId('');
        onSelect({});
    };

    const selectCategory = (value: string) => {
        setCategoryId(value);
        setSelectedCategoryId('');
        onSelect({});
    };

    const selectCategoryAsGoal = () => {
        if (!categoryId) {
            return;
        }
        setSelectedCategoryId(categoryId);
        onSelect({ categoryId });
    };

    const selectProduct = (productId: string) => {
        setSelectedCategoryId('');
        onSelect({ productId });
    };

    const search = (value: string) => {
        setSearchValue(value);
        setSelectedCategoryId('');
        onSelect({});
    };

    return {
        searchMode,
        searchValue,
        categoryId,
        selectedCategoryId,
        targetProducts,
        selectMode,
        selectCategory,
        selectCategoryAsGoal,
        selectProduct,
        search,
    };
};
