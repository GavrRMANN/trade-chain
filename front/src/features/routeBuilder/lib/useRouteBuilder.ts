import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGetCategoriesQuery } from '@entities/category';
import { useGetProductsQuery } from '@entities/product';
import type { TProduct } from '@entities/product';
import { useGetCurrentUserQuery } from '@entities/user';

/** Собирает старт и цель маршрута без привязки к странице конкретного товара. */
export const useRouteBuilder = () => {
    const navigate = useNavigate();
    const currentUserQuery = useGetCurrentUserQuery();
    const currentCustomerId = currentUserQuery.data?.customer_id ?? '';
    const productsQuery = useGetProductsQuery({ offset: 0, limit: 100 });
    const categoriesQuery = useGetCategoriesQuery();

    const [sourceId, setSourceId] = useState('');
    const [targetId, setTargetId] = useState('');

    const sourceProducts = useMemo(
        () =>
            (productsQuery.data ?? []).filter(
                (product) =>
                    product.status === 'active' && product.customer_id === currentCustomerId,
            ),
        [currentCustomerId, productsQuery.data],
    );

    const selectedSource = sourceProducts.find((product) => product.product_id === sourceId);
    const selectedTarget = (productsQuery.data ?? []).find(
        (product) => product.product_id === targetId,
    );

    const buildRoute = () => {
        if (!sourceId || !targetId) {
            return;
        }

        const params = new URLSearchParams({ target: targetId, from: sourceId });
        navigate(`/route?${params.toString()}`);
    };

    return {
        sourceProducts,
        products: productsQuery.data ?? [],
        categories: categoriesQuery.data ?? [],
        currentCustomerId,
        sourceId,
        targetId,
        selectedSource,
        selectedTarget,
        isSourcesLoading: currentUserQuery.isLoading || productsQuery.isLoading,
        isTargetsLoading: categoriesQuery.isLoading || productsQuery.isLoading,
        hasTargetError: categoriesQuery.isError || productsQuery.isError,
        setSourceId,
        setTargetId,
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
