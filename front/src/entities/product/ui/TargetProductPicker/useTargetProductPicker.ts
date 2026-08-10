import { useDeferredValue, useMemo, useReducer } from 'react';

import type { TProduct, TTargetGoal } from '../../types';

export type { TTargetGoal };

export type TGoalSearchMode = 'product' | 'category';

type TPickerState = {
    searchMode: TGoalSearchMode;
    searchValue: string;
    categoryId: string;
    selectedCategoryId: string;
};

type TPickerAction =
    | { type: 'selectMode'; mode: TGoalSearchMode }
    | { type: 'selectCategory'; categoryId: string }
    | { type: 'selectCategoryAsGoal' }
    | { type: 'selectProduct' }
    | { type: 'search'; value: string };

const initialState: TPickerState = {
    searchMode: 'product',
    searchValue: '',
    categoryId: '',
    selectedCategoryId: '',
};

const pickerReducer = (state: TPickerState, action: TPickerAction): TPickerState => {
    switch (action.type) {
        case 'selectMode':
            return {
                ...state,
                searchMode: action.mode,
                searchValue: '',
                categoryId: '',
                selectedCategoryId: '',
            };
        case 'selectCategory':
            return { ...state, categoryId: action.categoryId, selectedCategoryId: '' };
        case 'selectCategoryAsGoal':
            return { ...state, selectedCategoryId: state.categoryId };
        case 'selectProduct':
            return { ...state, selectedCategoryId: '' };
        case 'search':
            return { ...state, searchValue: action.value, selectedCategoryId: '' };
        default:
            return state;
    }
};

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
    const [state, dispatch] = useReducer(pickerReducer, initialState);
    const deferredSearch = useDeferredValue(state.searchValue.trim());

    const targetProducts = useMemo(() => {
        const normalizedSearch = deferredSearch.toLocaleLowerCase('ru');

        return products
            .filter((product) => {
                const matchesCategory = !state.categoryId || product.category_id === state.categoryId;
                const matchesSearch =
                    !normalizedSearch ||
                    product.title.toLocaleLowerCase('ru').includes(normalizedSearch);

                return (
                    product.status === 'active' &&
                    product.customer_id !== currentCustomerId &&
                    (state.searchMode === 'product' ? matchesSearch : matchesCategory)
                );
            })
            .slice(0, 8);
    }, [currentCustomerId, deferredSearch, products, state.categoryId, state.searchMode]);

    const selectMode = (mode: TGoalSearchMode) => {
        dispatch({ type: 'selectMode', mode });
        onSelect({});
    };

    const selectCategory = (value: string) => {
        dispatch({ type: 'selectCategory', categoryId: value });
        onSelect({});
    };

    const selectCategoryAsGoal = () => {
        if (!state.categoryId) {
            return;
        }
        dispatch({ type: 'selectCategoryAsGoal' });
        onSelect({ categoryId: state.categoryId });
    };

    const selectProduct = (productId: string) => {
        dispatch({ type: 'selectProduct' });
        onSelect({ productId });
    };

    const search = (value: string) => {
        dispatch({ type: 'search', value });
        onSelect({});
    };

    return {
        searchMode: state.searchMode,
        searchValue: state.searchValue,
        categoryId: state.categoryId,
        selectedCategoryId: state.selectedCategoryId,
        targetProducts,
        selectMode,
        selectCategory,
        selectCategoryAsGoal,
        selectProduct,
        search,
    };
};
