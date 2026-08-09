import {useEffect, useState} from 'react';

import type {Category} from '@entities/category';
import {
    useAddWishlistOptionMutation,
    useCreateWishlistMutation,
    useRemoveWishlistOptionMutation,
} from '@entities/wishlist';
import type {TWishlist} from '@entities/wishlist';
import {useGetCategoriesQuery} from '@entities/category';
import {parseApiError} from '@shared/api';

type TWishlistEditorParams = {
    productId: string;
    productTitle: string;
    wishlist?: TWishlist;
    options: Category[];
};

export const useWishlistEditor = ({productId, productTitle, wishlist, options}: TWishlistEditorParams) => {
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [requestError, setRequestError] = useState<string>();
    const [isEditing, setIsEditing] = useState(false);

    const {data: categories = []} = useGetCategoriesQuery();
    const [createWishlist, {isLoading: isCreatingWishlist}] = useCreateWishlistMutation();
    const [addOption, {isLoading: isAdding}] = useAddWishlistOptionMutation();
    const [removeOption, {isLoading: isRemoving}] = useRemoveWishlistOptionMutation();

    const isLoading = isCreatingWishlist || isAdding || isRemoving;

    const availableOptions = categories
        .filter((category) => !options.some((option) => option.category_id === category.category_id))
        .map((category) => ({value: category.category_id, label: category.name}));

    useEffect(() => {
        setSelectedCategoryId('');
    }, [options.length]);

    const ensureWishlist = async (): Promise<TWishlist> => {
        if (wishlist) {
            return wishlist;
        }
        return createWishlist({product_id: productId, name: `Хочу взамен за ${productTitle}`}).unwrap();
    };

    const handleAdd = async () => {
        if (!selectedCategoryId) {
            return;
        }
        setRequestError(undefined);
        try {
            const target = await ensureWishlist();
            await addOption({id: target.wishlist_id, body: {category_id: selectedCategoryId}}).unwrap();
            setSelectedCategoryId('');
        } catch (error) {
            setRequestError(parseApiError(error, 'Не удалось обновить список желаний. Попробуйте ещё раз.'));
        }
    };

    const handleRemove = async (categoryId: string) => {
        if (!wishlist) {
            return;
        }
        setRequestError(undefined);
        try {
            await removeOption({id: wishlist.wishlist_id, categoryId}).unwrap();
        } catch (error) {
            setRequestError(parseApiError(error, 'Не удалось обновить список желаний. Попробуйте ещё раз.'));
        }
    };

    const toggleEditing = () => {
        setIsEditing((value) => !value);
    };
    const startEditing = () => {
        setIsEditing(true);
    };

    return {
        isEditing,
        isLoading,
        isAdding,
        isCreatingWishlist,
        selectedCategoryId,
        availableOptions,
        requestError,
        setSelectedCategoryId,
        handleAdd,
        handleRemove,
        toggleEditing,
        startEditing,
    };
};
