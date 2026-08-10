import { useMemo, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGetCategoriesQuery } from '@entities/category';
import { useGetProductsQuery } from '@entities/product';
import type { TProduct, TTargetGoal } from '@entities/product';
import { useGetCurrentUserQuery } from '@entities/user';

/** Собирает старт и цель маршрута без привязки к странице конкретного товара. */
export const useRouteBuilder = () => {
    const navigate = useNavigate();
    const currentUserQuery = useGetCurrentUserQuery();
    const currentCustomerId = currentUserQuery.data?.customer_id ?? '';
    const productsQuery = useGetProductsQuery({ offset: 0, limit: 100 });
    const categoriesQuery = useGetCategoriesQuery();

    const [{sourceId, targetGoal}, dispatch] = useReducer(
        (state: {sourceId: string; targetGoal: TTargetGoal}, action: {type: 'source' | 'target'; value: string | TTargetGoal}) =>
            action.type === 'source'
                ? {...state, sourceId: action.value as string}
                : {...state, targetGoal: action.value as TTargetGoal},
        {sourceId: '', targetGoal: {}},
    );

    const sourceProducts = useMemo(
        () =>
            (productsQuery.data ?? []).filter(
                (product) =>
                    product.status === 'active' && product.customer_id === currentCustomerId,
            ),
        [currentCustomerId, productsQuery.data],
    );

    const selectedSource = sourceProducts.find((product) => product.product_id === sourceId);
    const selectedTarget = targetGoal.productId
        ? (productsQuery.data ?? []).find((product) => product.product_id === targetGoal.productId)
        : undefined;
    const selectedCategoryName = targetGoal.categoryId
        ? (categoriesQuery.data ?? []).find((c) => c.category_id === targetGoal.categoryId)?.name
        : undefined;

    const hasTarget = Boolean(targetGoal.productId || targetGoal.categoryId);
    const targetLabel = selectedTarget?.title ?? selectedCategoryName ?? 'Выберите цель';
    const sourceProductMeta = new Map(
        sourceProducts.map((product) => [product.product_id, getProductMeta(product) || 'Активное объявление']),
    );

    const buildRoute = () => {
        if (!sourceId || !hasTarget) {
            return;
        }

        const params = new URLSearchParams({ from: sourceId });
        if (targetGoal.productId) {
            params.set('target', targetGoal.productId);
        }
        if (targetGoal.categoryId) {
            params.set('targetCategory', targetGoal.categoryId);
        }
        navigate(`/route?${params.toString()}`);
    };

    return {
        sourceProducts,
        products: productsQuery.data ?? [],
        categories: categoriesQuery.data ?? [],
        currentCustomerId,
        sourceId,
        targetGoal,
        selectedSource,
        selectedTarget,
        selectedCategoryName,
        targetLabel,
        sourceProductMeta,
        hasTarget,
        isSourcesLoading: currentUserQuery.isLoading || productsQuery.isLoading,
        isTargetsLoading: categoriesQuery.isLoading || productsQuery.isLoading,
        hasTargetError: categoriesQuery.isError || productsQuery.isError,
        setSourceId: (value: string) => dispatch({type: 'source', value}),
        setTargetGoal: (value: TTargetGoal) => dispatch({type: 'target', value}),
        buildRoute,
    };
};

export const getProductMeta = (product: TProduct): string =>
    [
        product.price === undefined ? undefined : `${product.price.toLocaleString('ru-RU')} ₽`,
        product.location,
    ]
        .filter(Boolean)
        .join(' · ');
