import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Textarea } from '@shared/ui/textarea';
import type { TCategory } from '@entities/category';
import type { TProduct } from '@entities/product';

import { CategoryPicker } from './CategoryPicker';
import Styles from './quick-product-form.module.css';
import { useQuickProductForm } from './useQuickProductForm';

type TQuickProductFormProps = {
    categories: TCategory[];
    /** Владелец создаваемой вещи. */
    customerId?: string;
    /** Созданный товар: вызывающий сразу выбирает его в предложении обмена. */
    onCreated: (product: TProduct) => void;
    /** Отказ от быстрого сценария — возврат к списку своих вещей. */
    onCancel?: () => void;
};

/**
 * Сокращённая форма добавления вещи, встроенная в предложение обмена.
 *
 * Пустой профиль иначе упирается в тупик: полная форма увела бы со страницы
 * и потеряла выбранную цель. Поля — минимум, по которому вещь можно
 * показать владельцу и подобрать следующий шаг.
 */
export const QuickProductForm = ({
    categories,
    customerId,
    onCreated,
    onCancel,
}: TQuickProductFormProps) => {
    const {
        title,
        categoryId,
        description,
        image,
        titleError,
        categoryError,
        requestError,
        isLoading,
        fileInputRef,
        imageError,
        handleImageChange,
        handleRemoveImage,
        setTitle,
        setCategoryId,
        setDescription,
        handleSubmit,
    } = useQuickProductForm({ customerId, onCreated });

    return (
        <form className={Styles['quick-form']} onSubmit={handleSubmit} noValidate>
            <Input
                label="Что вы отдаёте"
                name="quick-title"
                value={title}
                placeholder="Например, горный велосипед"
                onChange={setTitle}
                disabled={isLoading}
                error={titleError ? { showError: true, errorMessage: titleError } : undefined}
            />

            <div className={Styles['quick-form__field']}>
                <span className={Styles['quick-form__label']}>Категория</span>
                <CategoryPicker
                    categories={categories}
                    value={categoryId}
                    onChange={setCategoryId}
                    disabled={isLoading}
                    error={
                        categoryError ? { showError: true, errorMessage: categoryError } : undefined
                    }
                />
            </div>

            <Textarea
                label="Состояние и детали"
                name="quick-description"
                value={description}
                placeholder="Пара слов о состоянии вещи — это то, о чём спросят первым"
                onChange={setDescription}
                disabled={isLoading}
            />

            <div className={Styles['quick-form__field']}>
                <span className={Styles['quick-form__label']}>Фото (необязательно)</span>
                <div className={Styles['quick-form__image']}>
                    {image ? (
                        <>
                            <img
                                className={Styles['quick-form__preview']}
                                src={image}
                                alt="Предпросмотр"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleRemoveImage}
                                disabled={isLoading}
                            >
                                Удалить фото
                            </Button>
                        </>
                    ) : (
                        <button
                            type="button"
                            className={Styles['quick-form__dropzone']}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                        >
                            <span>Нажмите, чтобы загрузить фото</span>
                            <span className={Styles['quick-form__hint']}>JPG, PNG до 10 МБ</span>
                        </button>
                    )}
                    <input
                        ref={fileInputRef}
                        className={Styles['quick-form__file-input']}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isLoading}
                    />
                </div>
                {imageError && <p className={Styles['quick-form__error']}>{imageError}</p>}
            </div>

            {requestError && <p className={Styles['quick-form__error']}>{requestError}</p>}

            <div className={Styles['quick-form__actions']}>
                <Button type="submit" loading={isLoading} disabled={isLoading}>
                    Сохранить и продолжить
                </Button>
                {onCancel && (
                    <Button type="button" variant="text" onClick={onCancel} disabled={isLoading}>
                        Отмена
                    </Button>
                )}
            </div>
        </form>
    );
};
