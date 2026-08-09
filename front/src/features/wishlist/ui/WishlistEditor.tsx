import {useEffect, useState} from 'react';

import type {Category} from '@entities/category';
import {
    useAddWishlistOptionMutation,
    useCreateWishlistMutation,
    useRemoveWishlistOptionMutation,
} from '@entities/wishlist';
import type {TWishlist} from '@entities/wishlist';
import {useGetCategoriesQuery} from '@entities/category';
import {Selector} from '@shared/ui/selector';
import {Button} from '@shared/ui/button';

import Styles from './wishlist-editor.module.css';

type TWishlistEditorProps = {
    productId: string;
    productTitle: string;
    wishlist?: TWishlist;
    options: Category[];
};

const getErrorMessage = (error: unknown) => {
    if (typeof error === 'object' && error !== null && 'data' in error) {
        const data = error.data;
        if (typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string') {
            return data.error;
        }
    }
    return 'Не удалось обновить список желаний. Попробуйте ещё раз.';
};

export const WishlistEditor = ({productId, productTitle, wishlist, options}: TWishlistEditorProps) => {
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [requestError, setRequestError] = useState<string>();

    const {data: categories = []} = useGetCategoriesQuery();
    const [createWishlist, {isLoading: isCreatingWishlist}] = useCreateWishlistMutation();
    const [addOption, {isLoading: isAdding}] = useAddWishlistOptionMutation();
    const [removeOption, {isLoading: isRemoving}] = useRemoveWishlistOptionMutation();

    const isLoading = isCreatingWishlist || isAdding || isRemoving;

    // Доступные для добавления категории (ещё не в списке желаний).
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
            setRequestError(getErrorMessage(error));
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
            setRequestError(getErrorMessage(error));
        }
    };

    return (
        <div className={Styles.editor}>
            {options.length > 0 ? (
                <div className={Styles['editor__tags']}>
                    {options.map((option) => (
                        <span key={option.category_id} className={Styles['editor__tag']}>
                            {option.name}
                            <button
                                type="button"
                                className={Styles['editor__tag-remove']}
                                aria-label={`Убрать ${option.name}`}
                                disabled={isLoading}
                                onClick={() => handleRemove(option.category_id)}
                            >
                                ✕
                            </button>
                        </span>
                    ))}
                </div>
            ) : (
                <p className={Styles['editor__empty']}>
                    Вы ещё не указали, что хотите получить взамен.
                </p>
            )}

            <div className={Styles['editor__add']}>
                <div className={Styles['editor__selector']}>
                    <Selector
                        label="Добавить категорию"
                        name="wishlist-category"
                        value={selectedCategoryId}
                        options={availableOptions}
                        onSelect={setSelectedCategoryId}
                        disabled={isLoading || availableOptions.length === 0}
                    />
                </div>
                <Button
                    type="button"
                    variant="secondary"
                    disabled={!selectedCategoryId || isLoading}
                    loading={isAdding || isCreatingWishlist}
                    onClick={handleAdd}
                >
                    Добавить
                </Button>
            </div>

            {requestError && <p className={Styles['editor__error']}>{requestError}</p>}
        </div>
    );
};
