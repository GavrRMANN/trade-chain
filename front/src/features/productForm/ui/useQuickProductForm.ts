import { FormEvent, useCallback, useReducer } from 'react';

import { useCreateProductMutation } from '@entities/product';
import type { TProduct } from '@entities/product';
import { parseApiError } from '@shared/api';

import { useImageUpload } from './useImageUpload';

type TQuickProductFormParams = {
    /** Владелец создаваемой вещи. */
    customerId?: string;
    /** Вызывается с созданным товаром — например, чтобы сразу выбрать его в предложении. */
    onCreated: (product: TProduct) => void;
};

type TQuickFormState = {
    title: string;
    categoryId: string;
    image: string;
    description: string;
    titleError?: string;
    categoryError?: string;
    requestError?: string;
};

type TQuickFormAction = { type: 'setField'; payload: Partial<TQuickFormState> } | { type: 'reset' };

const initialState: TQuickFormState = {
    title: '',
    categoryId: '',
    image: '',
    description: '',
};

const quickFormReducer = (state: TQuickFormState, action: TQuickFormAction): TQuickFormState => {
    switch (action.type) {
        case 'setField':
            return { ...state, ...action.payload };
        case 'reset':
            return initialState;
    }
};

/**
 * Короткое создание вещи прямо в контексте чужого товара.
 *
 * Отдельного типа предложения здесь нет: создаётся обычная карточка товара
 * тем же запросом, что и полная форма. Цепочку эта форма не создаёт — её
 * создаст предложение обмена, из которого форма открыта, иначе цель
 * пришлось бы выбирать заново.
 */
export const useQuickProductForm = ({ customerId, onCreated }: TQuickProductFormParams) => {
    const [state, dispatch] = useReducer(quickFormReducer, initialState);
    const [createProduct, { isLoading }] = useCreateProductMutation();

    const setImage = useCallback((value: string) => {
        dispatch({ type: 'setField', payload: { image: value } });
    }, []);

    const { fileInputRef, imageError, handleImageChange, handleRemoveImage } = useImageUpload({
        onImageLoaded: setImage,
    });

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const title = state.title.trim();
        /* Категория обязательна, хотя API её и не требует: без категории
           подбор не сможет предложить следующий шаг маршрута. */
        const titleError = title ? undefined : 'Опишите вещь коротким названием';
        const categoryError = state.categoryId ? undefined : 'Выберите категорию';

        dispatch({
            type: 'setField',
            payload: { titleError, categoryError, requestError: undefined },
        });

        if (titleError || categoryError || !customerId) {
            if (!customerId) {
                dispatch({
                    type: 'setField',
                    payload: {
                        requestError: 'Не удалось определить пользователя. Войдите в аккаунт.',
                    },
                });
            }
            return;
        }

        try {
            const created = await createProduct({
                customer_id: customerId,
                category_id: state.categoryId,
                title,
                description: state.description.trim(),
                image: state.image.trim(),
            }).unwrap();

            dispatch({ type: 'reset' });
            handleRemoveImage();
            onCreated(created);
        } catch (error) {
            dispatch({
                type: 'setField',
                payload: {
                    requestError: parseApiError(
                        error,
                        'Не удалось сохранить вещь. Попробуйте ещё раз.',
                    ),
                },
            });
        }
    };

    return {
        ...state,
        isLoading,
        fileInputRef,
        imageError,
        handleImageChange,
        handleRemoveImage,
        setTitle: (value: string) =>
            dispatch({ type: 'setField', payload: { title: value, titleError: undefined } }),
        setCategoryId: (value: string) =>
            dispatch({
                type: 'setField',
                payload: { categoryId: value, categoryError: undefined },
            }),
        setDescription: (value: string) =>
            dispatch({ type: 'setField', payload: { description: value } }),
        handleSubmit,
    };
};
