import { useGetCategoriesQuery } from '@entities/category';
import { useGetProductsQuery } from '@entities/product';
import type { TProduct } from '@entities/product';
import { usePageTitle } from '@app/providers/pageTitle';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PRODUCTS_PAGE_SIZE = 20;

type TCatalogCategory = {
    id: string;
    title: string;
    image?: string;
};

/** Управляет данными, фильтром и навигацией каталога. */
export const useCatalog = () => {
    const { setTitle } = usePageTitle();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const searchQuery = searchParams.get('q')?.trim() ?? '';
    const categoryQuery = searchParams.get('category_id')?.trim() ?? '';
    const filtersKey = `${searchQuery}:${categoryQuery}`;
    const [offset, setOffset] = useState(0);
    const [products, setProducts] = useState<TProduct[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const isLoadingMoreRef = useRef(false);

    const {
        data: categories = [],
        isLoading: isCategoriesLoading,
        isError: isCategoriesError,
    } = useGetCategoriesQuery();

    const categoryFilters = useMemo<TCatalogCategory[]>(
        () => [
            { id: 'all', title: 'Все' },
            ...categories.map(({ category_id, name, image }) => ({
                id: category_id,
                title: name,
                image,
            })),
        ],
        [categories],
    );

    const { currentData, isLoading, isFetching, isError } = useGetProductsQuery({
        offset,
        limit: PRODUCTS_PAGE_SIZE,
        ...(searchQuery ? { q: searchQuery } : {}),
        ...(categoryQuery ? { category_id: categoryQuery } : {}),
    });

    useEffect(() => {
        setOffset(0);
        setProducts([]);
        setHasMore(true);
        isLoadingMoreRef.current = false;
    }, [filtersKey]);

    useEffect(() => {
        if (!currentData) return;

        setProducts((currentProducts) =>
            offset === 0
                ? currentData
                : [
                      ...currentProducts,
                      ...currentData.filter(
                          (product) =>
                              !currentProducts.some(
                                  ({ product_id }) => product_id === product.product_id,
                              ),
                      ),
                  ],
        );
        setHasMore(currentData.length === PRODUCTS_PAGE_SIZE);
        isLoadingMoreRef.current = false;
    }, [currentData, offset]);

    useEffect(() => {
        const sentinel = loadMoreRef.current;
        if (!sentinel || !hasMore || isFetching || isError) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isLoadingMoreRef.current) {
                    isLoadingMoreRef.current = true;
                    setOffset((currentOffset) => currentOffset + PRODUCTS_PAGE_SIZE);
                }
            },
            { rootMargin: '300px' },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, isError, isFetching]);

    useEffect(() => {
        if (categoryQuery && !categoryFilters.some(({ id }) => id === categoryQuery)) {
            setSearchParams(
                (currentParams) => {
                    currentParams.delete('category_id');
                    return currentParams;
                },
                { replace: true },
            );
        }
    }, [categoryFilters, categoryQuery, setSearchParams]);

    useLayoutEffect(() => {
        setTitle(
            searchQuery
                ? `Результаты поиска: ${searchQuery}`
                : categoryQuery
                  ? 'Объявления категории'
                  : 'Вещи в обороте',
        );
    }, [categoryQuery, searchQuery, setTitle]);

    const selectCategory = (categoryId: string) => {
        setSearchParams(
            (currentParams) => {
                if (categoryId === 'all') {
                    currentParams.delete('category_id');
                } else {
                    currentParams.set('category_id', categoryId);
                }

                return currentParams;
            },
            { replace: true },
        );
    };

    const openProduct = (productId: string) => {
        navigate(`/product/${productId}`);
    };

    const openCreateProduct = () => {
        navigate('/create');
    };

    return {
        categoryFilters,
        selectedCategory: categoryQuery || 'all',
        searchQuery,
        categoryQuery,
        products,
        isLoading,
        isFetching,
        isError,
        hasMore,
        loadMoreRef,
        isCategoriesLoading,
        isCategoriesError,
        selectCategory,
        openProduct,
        openCreateProduct,
    };
};
