import { useDeferredValue, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGetCategoriesQuery } from '@entities/category';
import { useGetProductsQuery } from '@entities/product';
import type { TProduct } from '@entities/product';
import { useGetCurrentUserQuery } from '@entities/user';

export type TGoalSearchMode = 'product' | 'category';

/** Собирает старт и цель маршрута без привязки к странице конкретного товара. */
export const useRouteBuilder = () => {
    const navigate = useNavigate();
    const currentUserQuery = useGetCurrentUserQuery();
    const currentCustomerId = currentUserQuery.data?.customer_id ?? '';
    const productsQuery = useGetProductsQuery({ offset: 0, limit: 100 });
    const categoriesQuery = useGetCategoriesQuery();

    const [sourceId, setSourceId] = useState('');
    const [targetId, setTargetId] = useState('');
    const [searchMode, setSearchMode] = useState<TGoalSearchMode>('product');
    const [searchValue, setSearchValue] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const deferredSearch = useDeferredValue(searchValue.trim());

    const sourceProducts = useMemo(
        () =>
            (productsQuery.data ?? []).filter(
                (product) =>
                    product.status === 'active' && product.customer_id === currentCustomerId,
            ),
        [currentCustomerId, productsQuery.data],
    );

    const targetProducts = useMemo(() => {
        const normalizedSearch = deferredSearch.toLocaleLowerCase('ru');

        return (productsQuery.data ?? [])
            .filter((product) => {
                const isAnotherOwner = product.customer_id !== currentCustomerId;
                const matchesCategory = !categoryId || product.category_id === categoryId;
                const matchesSearch =
                    !normalizedSearch ||
                    product.title.toLocaleLowerCase('ru').includes(normalizedSearch);

                return (
                    product.status === 'active' &&
                    isAnotherOwner &&
                    (searchMode === 'product' ? matchesSearch : matchesCategory)
                );
            })
            .slice(0, 8);
    }, [categoryId, currentCustomerId, deferredSearch, productsQuery.data, searchMode]);

    const selectedSource = sourceProducts.find((product) => product.product_id === sourceId);
    const selectedTarget = targetProducts.find((product) => product.product_id === targetId);

    const selectMode = (mode: TGoalSearchMode) => {
        setSearchMode(mode);
        setTargetId('');
        setSearchValue('');
        setCategoryId('');
    };

    const selectCategory = (value: string) => {
        setCategoryId(value);
        setTargetId('');
    };

    const search = (value: string) => {
        setSearchValue(value);
        setTargetId('');
    };

    const buildRoute = () => {
        if (!sourceId || !targetId) {
            return;
        }

        const params = new URLSearchParams({ target: targetId, from: sourceId });
        navigate(`/route?${params.toString()}`);
    };

    return {
        sourceProducts,
        targetProducts,
        categories: categoriesQuery.data ?? [],
        sourceId,
        targetId,
        selectedSource,
        selectedTarget,
        searchMode,
        searchValue,
        categoryId,
        isSourcesLoading: currentUserQuery.isLoading || productsQuery.isLoading,
        isTargetsLoading: categoriesQuery.isLoading || productsQuery.isLoading,
        hasTargetError: categoriesQuery.isError || productsQuery.isError,
        setSourceId,
        setTargetId,
        selectMode,
        selectCategory,
        search,
        buildRoute,
    };
};

export const getProductMeta = (product: TProduct): string =>
    [product.price === undefined ? undefined : `${product.price.toLocaleString('ru-RU')} ₽`, product.location]
        .filter(Boolean)
        .join(' · ');
