import { useEffect, useReducer } from 'react';

import type { TCategory } from '@entities/category';
import {
    useAddWishlistOptionMutation,
    useCreateWishlistMutation,
    useRemoveWishlistOptionMutation,
} from '@entities/wishlist';
import type { TWishlist } from '@entities/wishlist';
import { useGetCategoriesQuery } from '@entities/category';
import { parseApiError } from '@shared/api';

type TWishlistEditorParams = {
    productId: string;
    productTitle: string;
    wishlist?: TWishlist;
    options: TCategory[];
};

type TEditorState = {
    selectedCategoryId: string;
    requestError?: string;
    isEditing: boolean;
};

type TEditorAction =
    | { type: 'selectCategory'; value: string }
    | { type: 'setError'; value?: string }
    | { type: 'toggleEditing' }
    | { type: 'setEditing'; value: boolean };

const editorReducer = (state: TEditorState, action: TEditorAction): TEditorState => {
    switch (action.type) {
        case 'selectCategory':
            return { ...state, selectedCategoryId: action.value };
        case 'setError':
            return { ...state, requestError: action.value };
        case 'toggleEditing':
            return { ...state, isEditing: !state.isEditing };
        case 'setEditing':
            return { ...state, isEditing: action.value };
    }
};

export const useWishlistEditor = ({
    productId,
    productTitle,
    wishlist,
    options,
}: TWishlistEditorParams) => {
    const [{ selectedCategoryId, requestError, isEditing }, dispatch] = useReducer(editorReducer, {
        selectedCategoryId: '',
        isEditing: false,
    });

    const { data: categories = [] } = useGetCategoriesQuery();
    const [createWishlist, { isLoading: isCreatingWishlist }] = useCreateWishlistMutation();
    const [addOption, { isLoading: isAdding }] = useAddWishlistOptionMutation();
    const [removeOption, { isLoading: isRemoving }] = useRemoveWishlistOptionMutation();

    const isLoading = isCreatingWishlist || isAdding || isRemoving;

    const availableOptions = categories
        .filter(
            (category) => !options.some((option) => option.category_id === category.category_id),
        )
        .map((category) => ({ value: category.category_id, label: category.name }));

    useEffect(() => {
        dispatch({ type: 'selectCategory', value: '' });
    }, [options.length]);

    const ensureWishlist = async (): Promise<TWishlist> => {
        if (wishlist) {
            return wishlist;
        }
        return createWishlist({
            product_id: productId,
            name: `Хочу взамен за ${productTitle}`,
        }).unwrap();
    };

    const handleAdd = async () => {
        if (!selectedCategoryId) {
            return;
        }
        dispatch({ type: 'setError' });
        try {
            const target = await ensureWishlist();
            await addOption({
                id: target.wishlist_id,
                body: { category_id: selectedCategoryId },
            }).unwrap();
            dispatch({ type: 'selectCategory', value: '' });
        } catch (error) {
            dispatch({
                type: 'setError',
                value: parseApiError(
                    error,
                    'Не удалось обновить список желаний. Попробуйте ещё раз.',
                ),
            });
        }
    };

    const handleRemove = async (categoryId: string) => {
        if (!wishlist) {
            return;
        }
        dispatch({ type: 'setError' });
        try {
            await removeOption({ id: wishlist.wishlist_id, categoryId }).unwrap();
        } catch (error) {
            dispatch({
                type: 'setError',
                value: parseApiError(
                    error,
                    'Не удалось обновить список желаний. Попробуйте ещё раз.',
                ),
            });
        }
    };

    const toggleEditing = () => {
        dispatch({ type: 'toggleEditing' });
    };
    const startEditing = () => {
        dispatch({ type: 'setEditing', value: true });
    };

    return {
        isEditing,
        isLoading,
        isAdding,
        isCreatingWishlist,
        selectedCategoryId,
        availableOptions,
        requestError,
        setSelectedCategoryId: (value: string) => dispatch({ type: 'selectCategory', value }),
        handleAdd,
        handleRemove,
        toggleEditing,
        startEditing,
    };
};
