import {FormEvent, useEffect, useMemo, useReducer} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';

import {
    useCreateProductMutation,
    useGetProductQuery,
    useGetProductsQuery,
    useUpdateProductMutation,
} from '@entities/product';
import { useCreateChainMutation } from '@entities/chain';
import {useGetCategoriesQuery} from '@entities/category';
import {useGetCurrentUserQuery} from '@entities/user';
import type {TProductStatus, TTargetGoal} from '@entities/product';

export type TField =
    | 'title'
    | 'categoryId'
    | 'description'
    | 'price'
    | 'location'
    | 'targetGoal';

export type TErrors = Partial<Record<TField, string>>;

type TFormState = {
    title: string;
    categoryId: string;
    description: string;
    image: string;
    price: string;
    location: string;
    status: TProductStatus;
    targetGoal: TTargetGoal;
    createdProductId?: string;
    errors: TErrors;
    requestError?: string;
    isOwnerError: boolean;
    isInitialized: boolean;
};
type TFormAction = {type: 'update'; payload: Partial<TFormState>};
const formReducer = (state: TFormState, action: TFormAction): TFormState => ({
    ...state,
    ...action.payload,
});

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
    targetGoal: TTargetGoal,
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

    if (!isEdit && !targetGoal.productId && !targetGoal.categoryId) {
        errors.targetGoal = 'Выберите товар или категорию, к которой хотите прийти';
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
    const [searchParams] = useSearchParams();
    const isEdit = Boolean(productId);
    /* Цель, с которой пользователь пришёл из карточки товара или ленты:
       после создания вещи он должен продолжить обмен именно с ней, а не
       выбирать цель заново. */
    const presetTargetProductId = searchParams.get('target')?.trim() ?? '';
    const presetTargetCategoryId = searchParams.get('targetCategory')?.trim() ?? '';

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

    const [state, dispatch] = useReducer(formReducer, {
        title: '', categoryId: '', description: '', image: '', price: '', location: '',
        status: 'active', targetGoal: {}, errors: {}, isOwnerError: false, isInitialized: false,
    });
    const {
        title, categoryId, description, image, price, location, status, targetGoal,
        createdProductId, errors, requestError, isOwnerError, isInitialized,
    } = state;
    const update = <K extends keyof TFormState>(key: K, value: TFormState[K]) =>
        dispatch({type: 'update', payload: {[key]: value}});
    const setTitle = (value: string) => update('title', value);
    const setCategoryId = (value: string) => update('categoryId', value);
    const setDescription = (value: string) => update('description', value);
    const setImage = (value: string) => update('image', value);
    const setPrice = (value: string) => update('price', value);
    const setLocation = (value: string) => update('location', value);
    const setStatus = (value: TProductStatus) => update('status', value);
    const setTargetGoal = (value: TTargetGoal) => update('targetGoal', value);

    const editableProduct = productQuery.data;

    // Цель из адреса подставляется один раз: дальше пользователь волен её сменить.
    useEffect(() => {
        if (isEdit || isInitialized || (!presetTargetProductId && !presetTargetCategoryId)) {
            return;
        }

        dispatch({
            type: 'update',
            payload: {
                targetGoal: presetTargetProductId
                    ? {productId: presetTargetProductId}
                    : {categoryId: presetTargetCategoryId},
                isInitialized: true,
            },
        });
    }, [isEdit, isInitialized, presetTargetCategoryId, presetTargetProductId]);

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
            dispatch({type: 'update', payload: {isOwnerError: true, isInitialized: true}});
            return;
        }
        dispatch({type: 'update', payload: {
            title: editableProduct.title,
            categoryId: editableProduct.category_id ?? '',
            description: editableProduct.description ?? '',
            image: editableProduct.image ?? '',
            price: editableProduct.price !== undefined && editableProduct.price !== null
                ? String(editableProduct.price) : '',
            location: editableProduct.location ?? '',
            status: editableProduct.status,
            isInitialized: true,
        }});
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
        update('requestError', undefined);

        const validationErrors = validate(
            title,
            categoryId,
            description,
            price,
            location,
            targetGoal,
            isEdit,
        );
        update('errors', validationErrors);

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
                update('requestError', 'Не удалось определить пользователя. Войдите в аккаунт.');
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
                update('createdProductId', sourceProductId);
            }

            await createChain({
                from_product_id: sourceProductId,
                ...(targetGoal.productId ? { to_product_id: targetGoal.productId } : {}),
                ...(targetGoal.categoryId ? { to_category_id: targetGoal.categoryId } : {}),
                ...(targetGoal.productId ? { exchange_goal_id: targetGoal.productId } : {}),
                route_step_id: sourceProductId,
                status: 'pending',
                message: `Предложение по новому объявлению «${title.trim()}»`,
            }).unwrap();

            const routeParams = new URLSearchParams({from: sourceProductId});
            if (targetGoal.productId) {
                routeParams.set('target', targetGoal.productId);
            } else if (targetGoal.categoryId) {
                routeParams.set('targetCategory', targetGoal.categoryId);
            }
            navigate(`/route?${routeParams.toString()}`, {replace: true});
        } catch (error) {
            update('requestError',
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
        targetGoal,
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
        setTargetGoal,
        handleSubmit,
    };
};
