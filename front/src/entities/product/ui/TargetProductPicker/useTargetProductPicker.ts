import { useDeferredValue, useMemo, useState } from 'react';

import type { TProduct } from '../../types';

export type TGoalSearchMode = 'product' | 'category';

type TUseTargetProductPickerParams = {
    products: TProduct[];
    currentCustomerId: string;
    onSelect: (productId: string) => void;
};

/** Управляет фильтрами и выбором целевого товара для обмена. */
export const useTargetProductPicker = ({
    products,
    currentCustomerId,
    onSelect,
}: TUseTargetProductPickerParams) => {
    const [searchMode, setSearchMode] = useState<TGoalSearchMode>('product');
    const [searchValue, setSearchValue] = useState('');
    const [categoryId, setCategoryId] = useState('');
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
        onSelect('');
    };

    const selectCategory = (value: string) => {
        setCategoryId(value);
        onSelect('');
    };

    const search = (value: string) => {
        setSearchValue(value);
        onSelect('');
    };

    return {
        searchMode,
        searchValue,
        categoryId,
        targetProducts,
        selectMode,
        selectCategory,
        search,
    };
};
