import {FormEvent, useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import {
    useCreateProductMutation,
    useGetProductQuery,
    useGetProductsQuery,
    useUpdateProductMutation,
} from '@entities/product';
import { useCreateChainMutation } from '@entities/chain';
import {useGetCategoriesQuery} from '@entities/category';
import {useGetCurrentUserQuery} from '@entities/user';
import type {TProductStatus} from '@entities/product';

export type TField =
    | 'title'
    | 'categoryId'
    | 'description'
    | 'price'
    | 'location'
    | 'targetProductId';

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
    targetProductId: string,
    isEdit: boolean,
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

    if (!isEdit && !targetProductId) {
        errors.targetProductId = 'Выберите объявление, к которому хотите прийти';
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

    const {data: user, isLoading: isUserLoading} = useGetCurrentUserQuery();
    const productQuery = useGetProductQuery(productId ?? '', {skip: !productId});
    const targetProductsQuery = useGetProductsQuery(
        {offset: 0, limit: 100},
        {skip: isEdit},
    );
    const {data: categories = [], isLoading: isCategoriesLoading, isError: isCategoriesError} =
        useGetCategoriesQuery();

    const [createProduct, {isLoading: isCreating}] = useCreateProductMutation();
    const [createChain, {isLoading: isChainCreating}] = useCreateChainMutation();
    const [updateProduct, {isLoading: isUpdating}] = useUpdateProductMutation();

    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [price, setPrice] = useState('');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState<TProductStatus>('active');
    const [targetProductId, setTargetProductId] = useState('');
    const [createdProductId, setCreatedProductId] = useState<string>();

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

    const isLoading = isCreating || isUpdating || isChainCreating;
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

        const validationErrors = validate(
            title,
            categoryId,
            description,
            price,
            location,
            targetProductId,
            isEdit,
        );
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

            let sourceProductId = createdProductId;

            if (!sourceProductId) {
                const created = await createProduct({
                    customer_id: user.customer_id,
                    category_id: categoryId,
                    title: title.trim(),
                    description: description.trim(),
                    image: image.trim(),
                    price: numericPrice,
                    location: location.trim(),
                }).unwrap();
                sourceProductId = created.product_id;
                setCreatedProductId(sourceProductId);
            }

            const chain = await createChain({
                from_product_id: sourceProductId,
                to_product_id: targetProductId,
                exchange_goal_id: targetProductId,
                route_step_id: sourceProductId,
                status: 'pending',
                message: `Предложение по новому объявлению «${title.trim()}»`,
            }).unwrap();

            navigate(`/exchanges/${chain.chain_id}`, {replace: true});
        } catch (error) {
            setRequestError(
                createdProductId
                    ? `Объявление уже создано. ${getErrorMessage(error)} Повторите отправку предложения.`
                    : getErrorMessage(error),
            );
        }
    };

    return {
        isEdit,
        categories,
        targetProducts: targetProductsQuery.data ?? [],
        currentCustomerId: user?.customer_id ?? '',
        categoryPath,
        statusOptions,
        // данные товара для экранов загрузки/ошибки
        editableProduct,
        isProductLoading,
        isProductError: Boolean(productQuery.isError),
        isFetchingUser,
        isCategoriesLoading,
        isCategoriesError,
        isTargetProductsLoading: isUserLoading || targetProductsQuery.isLoading,
        isTargetProductsError: targetProductsQuery.isError,
        isOwnerError,
        // поля формы
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
        // сеттеры
        setTitle,
        setCategoryId,
        setDescription,
        setImage,
        setPrice,
        setLocation,
        setStatus,
        setTargetProductId,
        handleSubmit,
    };
};
