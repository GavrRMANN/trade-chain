import type { TCategory } from '@entities/category';
import type { TWishlist } from '@entities/wishlist';
import { Selector } from '@shared/ui/selector';
import { Button } from '@shared/ui/button';

import Styles from './wishlist-editor.module.css';
import { useWishlistEditor } from './useWishlistEditor';

type TWishlistEditorProps = {
    productId: string;
    productTitle: string;
    wishlist?: TWishlist;
    options: TCategory[];
};

export const WishlistEditor = ({
    productId,
    productTitle,
    wishlist,
    options,
}: TWishlistEditorProps) => {
    const {
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
    } = useWishlistEditor({ productId, productTitle, wishlist, options });

    return (
        <div className={Styles.editor}>
            <div className={Styles['editor__title-row']}>
                <h2>Хочу взамен</h2>
                <button type="button" className={Styles['editor__edit']} onClick={toggleEditing}>
                    {isEditing ? 'Готово' : 'Редактировать'} {!isEditing && '✎'}
                </button>
            </div>
            <p className={Styles['editor__label']}>Интересуют следующие категории:</p>

            {options.length > 0 ? (
                <div className={Styles['editor__tags']}>
                    {options.map((option) => (
                        <span
                            key={option.category_id}
                            className={`${Styles['editor__tag']} ${!isEditing ? Styles['editor__tag--readonly'] : ''}`}
                        >
                            {option.name}
                            {isEditing && (
                                <button
                                    type="button"
                                    className={Styles['editor__tag-remove']}
                                    aria-label={`Убрать ${option.name}`}
                                    disabled={isLoading}
                                    onClick={() => handleRemove(option.category_id)}
                                >
                                    ✕
                                </button>
                            )}
                            {!isEditing && (
                                <span aria-hidden="true" className={Styles['editor__tag-close']}>
                                    ×
                                </span>
                            )}
                        </span>
                    ))}
                </div>
            ) : (
                <p className={Styles['editor__empty']}>
                    Вы ещё не указали, что хотите получить взамен.
                </p>
            )}

            {!isEditing ? (
                <button type="button" className={Styles['editor__add-link']} onClick={startEditing}>
                    <span aria-hidden="true">＋</span> Добавить категорию
                </button>
            ) : (
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
            )}

            {requestError && <p className={Styles['editor__error']}>{requestError}</p>}
        </div>
    );
};
