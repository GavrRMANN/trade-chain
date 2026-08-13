import {Selector} from '@shared/ui/selector';
import {Button} from '@shared/ui/button';

import Styles from './customer-recommendations-editor.module.css';
import {useCustomerRecommendationsEditor} from './useCustomerRecommendationsEditor';

/** Список категорий, которые интересуют текущего клиента, с возможностью правки. */
export const CustomerRecommendationsEditor = () => {
    const {
        isEditing,
        isLoading,
        isAdding,
        isRecommendationsLoading,
        selectedCategoryId,
        selectedCategories,
        availableOptions,
        requestError,
        setSelectedCategoryId,
        handleAdd,
        handleRemove,
        toggleEditing,
        startEditing,
    } = useCustomerRecommendationsEditor();

    if (isRecommendationsLoading) {
        return null;
    }

    return (
        <div className={Styles.editor}>
            <div className={Styles['editor__title-row']}>
                <h2>Интересные категории</h2>
                <button type="button" className={Styles['editor__edit']} onClick={toggleEditing}>
                    {isEditing ? 'Готово' : 'Редактировать'} {!isEditing && '✎'}
                </button>
            </div>
            <p className={Styles['editor__label']}>Показываем товары из этих категорий в первую очередь:</p>

            {selectedCategories.length > 0 ? (
                <div className={Styles['editor__tags']}>
                    {selectedCategories.map((category) => (
                        <span key={category!.category_id} className={`${Styles['editor__tag']} ${!isEditing ? Styles['editor__tag--readonly'] : ''}`}>
                            {category!.name}
                            {isEditing && (
                                <button
                                    type="button"
                                    className={Styles['editor__tag-remove']}
                                    aria-label={`Убрать ${category!.name}`}
                                    disabled={isLoading}
                                    onClick={() => handleRemove(category!.category_id)}
                                >
                                    ✕
                                </button>
                            )}
                        </span>
                    ))}
                </div>
            ) : (
                <p className={Styles['editor__empty']}>
                    Вы ещё не отметили интересные категории.
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
                            name="customer-recommendation-category"
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
                        loading={isAdding}
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
