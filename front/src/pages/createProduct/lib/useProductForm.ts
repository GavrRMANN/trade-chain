import {FormEvent, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import {
    useCreateProductMutation,
    useGetProductQuery,
    useUpdateProductMutation,
} from '@entities/product';
import {useGetCategoriesQuery} from '@entities/category';
import {useGetCurrentUserQuery} from '@entities/user';
import {getAuthToken} from '@shared/api';
import type {TProductStatus} from '@entities/product';

export type TField =
    | 'title'
    | 'categoryId'
    | 'description'
    | 'price'
    | 'location';

export type TErrors = Partial<Record<TField, string>>;

const getErrorMessage = (error: unknown) => {
    if (typeof error === 'object' && error !== null && 'data' in error) {
        const data = error.data;
        if (typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string') {
            return data.error;
        }
    }
    return 'Не удалось сохранить объявление. Попробуйте ещё раз.';
};

const validate = (
    title: string,
    categoryId: string,
    description: string,
    price: string,
    location: string,
): TErrors => {
    const errors: TErrors = {};

    if (!title.trim()) {
        errors.title = 'Введите название объявления';
    } else if (title.trim().length > 255) {
        errors.title = 'Название не может быть длиннее 255 символов';
    }

    if (!categoryId) {
        errors.categoryId = 'Выберите категорию';
    }

    if (description.length > 5000) {
        errors.description = 'Описание слишком длинное';
    }

    if (location.length > 255) {
        errors.location = 'Город не может быть длиннее 255 символов';
    }

    const trimmedPrice = price.trim();
    if (trimmedPrice) {
        if (!/^\d+$/.test(trimmedPrice.replace(/\s/g, ''))) {
            errors.price = 'Цена должна быть целым числом';
        } else {
            const numeric = Number(trimmedPrice.replace(/\s/g, ''));
            if (!Number.isFinite(numeric) || numeric < 0) {
                errors.price = 'Введите корректную цену';
            }
        }
    }

    return errors;
};

const statusOptions: {value: TProductStatus; label: string}[] = [
    {value: 'active', label: 'Активен'},
    {value: 'reserved', label: 'Зарезервирован'},
    {value: 'exchanged', label: 'Обменян'},
];

/** Управляет состоянием, валидацией и отправкой формы создания/редактирования товара. */
export const useProductForm = (productId?: string) => {
    const navigate = useNavigate();
    const isEdit = Boolean(productId);
    const isAuthenticated = Boolean(getAuthToken());

    const {data: user, isLoading: isUserLoading} = useGetCurrentUserQuery(undefined, {
        skip: !isAuthenticated,
    });
    const productQuery = useGetProductQuery(productId ?? '', {skip: !productId});
    const {data: categories = [], isLoading: isCategoriesLoading, isError: isCategoriesError} =
        useGetCategoriesQuery();

    const [createProduct, {isLoading: isCreating}] = useCreateProductMutation();
    const [updateProduct, {isLoading: isUpdating}] = useUpdateProductMutation();

    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [price, setPrice] = useState('');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState<TProductStatus>('active');

    const [errors, setErrors] = useState<TErrors>({});
    const [requestError, setRequestError] = useState<string>();
    const [isOwnerError, setIsOwnerError] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const editableProduct = productQuery.data;

    // Заполняем форму данными товара в режиме редактирования (один раз).
    useEffect(() => {
        if (!isEdit || isInitialized) {
            return;
        }
        if (!editableProduct) {
            return;
        }
        // Проверяем владельца: редактировать может только собственник.
        if (user && editableProduct.customer_id !== user.customer_id) {
            setIsOwnerError(true);
            setIsInitialized(true);
            return;
        }
        setTitle(editableProduct.title);
        setCategoryId(editableProduct.category_id ?? '');
        setDescription(editableProduct.description ?? '');
        setImage(editableProduct.image ?? '');
        setPrice(
            editableProduct.price !== undefined && editableProduct.price !== null
                ? String(editableProduct.price)
                : '',
        );
        setLocation(editableProduct.location ?? '');
        setStatus(editableProduct.status);
        setIsInitialized(true);
    }, [isEdit, isInitialized, editableProduct, user]);

    const isLoading = isCreating || isUpdating;
    const isProductLoading = isEdit && productQuery.isLoading;
    const isFetchingUser = isEdit && !isOwnerError && !editableProduct && isUserLoading;

    const categoryPath = useMemo(() => {
        if (!categoryId || categories.length === 0) {
            return [];
        }
        const path = [];
        let current = categories.find((category) => category.category_id === categoryId);
        const guard = new Set<string>();
        while (current && !guard.has(current.category_id)) {
            guard.add(current.category_id);
            path.unshift(current);
            const parentId = current.parent_id;
            current = parentId ? categories.find((category) => category.category_id === parentId) : undefined;
        }
        return path;
    }, [categoryId, categories]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setRequestError(undefined);

        const validationErrors = validate(title, categoryId, description, price, location);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        const trimmedPrice = price.trim().replace(/\s/g, '');
        const numericPrice = trimmedPrice ? Number(trimmedPrice) : 0;

        try {
            if (isEdit && productId) {
                await updateProduct({
                    productId,
                    data: {
                        title: title.trim(),
                        category_id: categoryId,
                        description: description.trim(),
                        image: image.trim(),
                        price: numericPrice,
                        location: location.trim(),
                        status,
                    },
                }).unwrap();
                navigate(`/product/${productId}`, {replace: true});
                return;
            }

            if (!user) {
                setRequestError('Не удалось определить пользователя. Войдите в аккаунт.');
                return;
            }

            const created = await createProduct({
                customer_id: user.customer_id,
                category_id: categoryId,
                title: title.trim(),
                description: description.trim(),
                image: image.trim(),
                price: numericPrice,
                location: location.trim(),
                status,
            }).unwrap();

            navigate(`/product/${created.product_id}`, {replace: true});
        } catch (error) {
            setRequestError(getErrorMessage(error));
        }
    };

    return {
        isEdit,
        isAuthenticated,
        categories,
        categoryPath,
        statusOptions,
        // данные товара для экранов загрузки/ошибки
        editableProduct,
        isProductLoading,
        isProductError: Boolean(productQuery.isError),
        isFetchingUser,
        isCategoriesLoading,
        isCategoriesError,
        isOwnerError,
        // поля формы
        title,
        categoryId,
        description,
        image,
        price,
        location,
        status,
        errors,
        requestError,
        isLoading,
        // сеттеры
        setTitle,
        setCategoryId,
        setDescription,
        setImage,
        setPrice,
        setLocation,
        setStatus,
        handleSubmit,
    };
};
