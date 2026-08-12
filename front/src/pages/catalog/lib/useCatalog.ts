import { useGetCategoriesQuery } from '@entities/category';
import { useGetProductsQuery } from '@entities/product';
import type { TProduct } from '@entities/product';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PRODUCTS_PAGE_SIZE = 20;

type TCatalogCategory = {
    id: string;
    title: string;
    icon?: string;
    image?: string;
};

/** Управляет данными, фильтром и навигацией каталога. */
export const useCatalog = () => {
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

    // Все категории, включая подкатегории, — нужны для проверки category_id
    // из URL (туда можно попасть не только через ленту, например из поиска)
    // и для заголовка выбранной категории.
    const allCategoryFilters = useMemo<TCatalogCategory[]>(
        () => [
            { id: 'all', title: 'Все' },
            ...categories.map(({ category_id, name, icon, image }) => ({
                id: category_id,
                title: name,
                icon,
                image,
            })),
        ],
        [categories],
    );

    // Лента быстрых фильтров показывает только категории верхнего уровня —
    // подкатегории (например, «Видеокарты» внутри «Комплектующих») в неё
    // не попадают, чтобы не дублировать вложенность плоским списком.
    const categoryFilters = useMemo<TCatalogCategory[]>(
        () => [
            allCategoryFilters[0],
            ...categories
                .filter(({ parent_id }) => !parent_id)
                .map(({ category_id, name, icon, image }) => ({
                    id: category_id,
                    title: name,
                    icon,
                    image,
                })),
        ],
        [allCategoryFilters, categories],
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
        if (categoryQuery && !allCategoryFilters.some(({ id }) => id === categoryQuery)) {
            setSearchParams(
                (currentParams) => {
                    currentParams.delete('category_id');
                    return currentParams;
                },
                { replace: true },
            );
        }
    }, [allCategoryFilters, categoryQuery, setSearchParams]);

    const selectedCategory = categoryQuery || 'all';

    const title = searchQuery
        ? `Результаты поиска: ${searchQuery}`
        : categoryQuery
          ? 'Объявления категории'
          : 'Вещи в обороте';

    /* Название выбранной категории и число найденного — то, что должно
       оставаться на виду при прокрутке длинной ленты. */
    const categoryTitle = allCategoryFilters.find(({ id }) => id === selectedCategory)?.title;

    // Лента отвечает на вопрос «почему мне это показали»: сверху идут вещи,
    // владельцам которых подходит что-то из профиля пользователя. Разделение
    // делается на клиенте, но порядок задаёт бэкенд — подходящие карточки
    // приходят первыми во всей выдаче, а не только на текущей странице.
    const matchedProducts = useMemo(() => products.filter(({ matched }) => matched), [products]);
    const restProducts = useMemo(() => products.filter(({ matched }) => !matched), [products]);

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
        title,
        categoryTitle,
        categoryFilters,
        selectedCategory,
        searchQuery,
        categoryQuery,
        products,
        matchedProducts,
        restProducts,
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
