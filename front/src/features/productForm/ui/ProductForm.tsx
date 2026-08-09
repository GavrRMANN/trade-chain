import { useCallback } from 'react';

import {Button} from '@shared/ui/button';
import {Input} from '@shared/ui/input';
import {Selector} from '@shared/ui/selector';
import {Textarea} from '@shared/ui/textarea';
import {sanitizePrice} from '@shared/lib';
import type {TCategory} from '@entities/category';
import { TargetProductPicker } from '@entities/product';
import type {TProduct, TProductStatus} from '@entities/product';

import {CategoryPicker} from './CategoryPicker';
import Styles from './product-form.module.css';
import {useImageUpload} from './useImageUpload';

type TField = 'title' | 'categoryId' | 'description' | 'price' | 'location' | 'targetProductId';
type TErrors = Partial<Record<TField, string>>;

type TProductFormProps = {
    isEdit: boolean;
    categories: TCategory[];
    targetProducts: TProduct[];
    currentCustomerId: string;
    statusOptions: {value: TProductStatus; label: string}[];
    title: string;
    categoryId: string;
    description: string;
    image: string;
    price: string;
    location: string;
    status: TProductStatus;
    targetProductId: string;
    errors: TErrors;
    requestError?: string;
    isLoading: boolean;
    isTargetProductsLoading: boolean;
    isTargetProductsError: boolean;
    setTitle: (value: string) => void;
    setCategoryId: (value: string) => void;
    setDescription: (value: string) => void;
    setImage: (value: string) => void;
    setPrice: (value: string) => void;
    setLocation: (value: string) => void;
    setStatus: (value: TProductStatus) => void;
    setTargetProductId: (value: string) => void;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const ProductForm = ({
    isEdit,
    categories,
    targetProducts,
    currentCustomerId,
    statusOptions,
    title,
    categoryId,
    description,
    image,
    price,
    location,
    status,
    targetProductId,
    errors,
    requestError,
    isLoading,
    isTargetProductsLoading,
    isTargetProductsError,
    setTitle,
    setCategoryId,
    setDescription,
    setImage,
    setPrice,
    setLocation,
    setStatus,
    setTargetProductId,
    handleSubmit,
}: TProductFormProps) => {
    const { fileInputRef, imageError, handleImageChange, handleRemoveImage } = useImageUpload({
        onImageLoaded: setImage,
    });

    const handlePriceChange = useCallback((value: string) => {
        setPrice(sanitizePrice(value));
    }, [setPrice]);

    return (
        <form className={Styles.form} onSubmit={handleSubmit} noValidate>
            <div className={Styles['form__main']}>
                <Input
                    label="Название"
                    name="title"
                    value={title}
                    placeholder="Например, Велосипед Merida"
                    onChange={setTitle}
                    disabled={isLoading}
                    error={{showError: Boolean(errors.title), errorMessage: errors.title ?? ''}}
                />

                <div className={Styles['form__field']}>
                    <span className={Styles['form__field-label']}>Категория</span>
                    <CategoryPicker
                        categories={categories}
                        value={categoryId}
                        onChange={setCategoryId}
                        disabled={isLoading}
                        error={{
                            showError: Boolean(errors.categoryId),
                            errorMessage: errors.categoryId ?? '',
                        }}
                    />
                </div>

                <Textarea
                    label="Описание"
                    name="description"
                    value={description}
                    placeholder="Опишите состояние, особенности и условия обмена"
                    onChange={setDescription}
                    disabled={isLoading}
                    rows={5}
                    error={{
                        showError: Boolean(errors.description),
                        errorMessage: errors.description ?? '',
                    }}
                />

                <div className={Styles['form__row']}>
                    <Input
                        label="Цена, ₽"
                        name="price"
                        value={price}
                        placeholder="0"
                        onChange={handlePriceChange}
                        disabled={isLoading}
                        error={{showError: Boolean(errors.price), errorMessage: errors.price ?? ''}}
                    />
                    <Input
                        label="Город"
                        name="location"
                        value={location}
                        placeholder="Например, Москва"
                        onChange={setLocation}
                        disabled={isLoading}
                        error={{
                            showError: Boolean(errors.location),
                            errorMessage: errors.location ?? '',
                        }}
                    />
                </div>

                {isEdit && (
                    <Selector
                        label="Статус"
                        name="status"
                        value={status}
                        options={statusOptions}
                        onSelect={(value) => setStatus(value as TProductStatus)}
                        disabled={isLoading}
                    />
                )}
            </div>

            <aside className={Styles['form__sidebar']}>
                <div className={Styles['form__field']}>
                    <span className={Styles['form__field-label']}>Фотография</span>
                    <div className={Styles['form__image']}>
                        {image ? (
                            <>
                                <img className={Styles['form__image-preview']} src={image} alt="Предпросмотр" />
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
                                className={Styles['form__image-dropzone']}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                            >
                                <span className={Styles['form__dropzone-text']}>
                                    Нажмите, чтобы загрузить фото
                                </span>
                                <span className={Styles['form__dropzone-hint']}>JPG, PNG до 10 МБ</span>
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            className={Styles['form__file-input']}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>
                    {imageError && <p className={Styles['form__error-text']}>{imageError}</p>}
                </div>
            </aside>

            {!isEdit && (
                <div className={`${Styles['form__field']} ${Styles['form__target']}`}>
                    <TargetProductPicker
                        products={targetProducts}
                        categories={categories}
                        currentCustomerId={currentCustomerId}
                        value={targetProductId}
                        disabled={isLoading}
                        isLoading={isTargetProductsLoading}
                        isError={isTargetProductsError}
                        onChange={setTargetProductId}
                    />
                    {errors.targetProductId && (
                        <p className={Styles['form__error-text']}>{errors.targetProductId}</p>
                    )}
                </div>
            )}

            {requestError && <p className={Styles['form__error']}>{requestError}</p>}

            <div className={Styles['form__actions']}>
                <Button type="submit" className={Styles['form__submit']} loading={isLoading}>
                    {isEdit ? 'Сохранить изменения' : 'Опубликовать объявление'}
                </Button>
            </div>
        </form>
    );
};
