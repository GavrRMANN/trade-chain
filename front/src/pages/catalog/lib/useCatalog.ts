import { useGetCategoriesQuery } from '@entities/category';
import { useGetProductsQuery } from '@entities/product';
import type { TProduct } from '@entities/product';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useOpenModalRoute } from '@shared/lib';

import { readCatalogSnapshot, saveCatalogSnapshot } from './catalogSnapshot';
import { useGridScrollRestore } from './useGridScrollRestore';
import type { TCatalogViewMode } from './useCatalogViewMode';

const PRODUCTS_PAGE_SIZE = 20;

type TCatalogCategory = {
    id: string;
    title: string;
    icon?: string;
    image?: string;
};

/**
 * Управляет данными, фильтром, позицией и навигацией каталога.
 * @param viewMode Текущее представление каталога — от него зависит, что
 *   именно восстанавливать при возврате: прокрутку сетки или карточку ленты.
 */
export const useCatalog = (viewMode: TCatalogViewMode) => {
    const navigate = useNavigate();
    const openModalRoute = useOpenModalRoute();
    const [searchParams, setSearchParams] = useSearchParams();

    const searchQuery = searchParams.get('q')?.trim() ?? '';
    const categoryQuery = searchParams.get('category_id')?.trim() ?? '';
    const filtersKey = `${searchQuery}:${categoryQuery}`;

    /* Каталог открывается тем же списком, каким его оставили: иначе возврат
       с карточки товара выбрасывал бы к первой странице выдачи. Снимок
       читается один раз при монтировании — дальше состояние ведёт страница. */
    const [restored] = useState(() => readCatalogSnapshot(filtersKey));
    const [offset, setOffset] = useState(restored.offset);
    const [products, setProducts] = useState<TProduct[]>(restored.products);
    const [hasMore, setHasMore] = useState(restored.hasMore);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const isLoadingMoreRef = useRef(false);
    const appliedFiltersRef = useRef(filtersKey);

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

    // Сброс — реакция на смену фильтра, а не на монтирование: при открытии
    // страница уже пришла со снимком, и обнулять его нечем и незачем.
    useEffect(() => {
        if (appliedFiltersRef.current === filtersKey) return;

        appliedFiltersRef.current = filtersKey;
        setOffset(0);
        setProducts([]);
        setHasMore(true);
        isLoadingMoreRef.current = false;
    }, [filtersKey]);

    // Снимок обновляется вслед за списком: уйти со страницы можно в любой
    // момент, в том числе прямо во время догрузки следующей порции.
    useEffect(() => {
        saveCatalogSnapshot(filtersKey, { products, offset, hasMore });
    }, [filtersKey, hasMore, offset, products]);

    useGridScrollRestore({
        filtersKey,
        enabled: viewMode === 'grid',
        itemsCount: products.length,
    });

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

    const openOwner = (customerId: string) => {
        navigate(`/profile/${customerId}`);
    };

    /* Из ленты доступен тот же вход в подбор маршрута, что и с карточки
       товара: лента не заводит собственного сценария. */
    const openRouteTo = (productId: string) => {
        navigate(`/route?target=${encodeURIComponent(productId)}`);
    };

    /* Предложение обмена из ленты — тот же маршрут, что и с карточки товара:
       лента остаётся под модалкой фоном и не теряет прокрутку. */
    const openOffer = (productId: string) => {
        openModalRoute({ name: 'offerExchange', productId });
    };

    /* Позиция ленты хранится карточкой, а не пикселями прокрутки: карточка
       занимает вьюпорт целиком, и после поворота экрана те же пиксели
       указывали бы уже на соседнюю вещь.

       Значение читается из снимка на каждый рендер, а не берётся из
       состояния: так лента открывается на нужной карточке и после
       переключения «Сетка → Лента», когда она монтируется заново. */
    const feedIndex = readCatalogSnapshot(filtersKey).feedIndex;

    /* Лента сообщает активную карточку на каждое пролистывание: состояние
       страницы от этого не меняется, поэтому индекс уходит прямо в снимок,
       не вызывая перерисовку ленты на каждом свайпе. */
    const saveFeedIndex = useCallback(
        (index: number) => {
            saveCatalogSnapshot(filtersKey, { feedIndex: index });
        },
        [filtersKey],
    );

    // Названия категорий нужны ленте: там подпись видна прямо на карточке.
    const categoryNames = useMemo(
        () => new Map(categories.map(({ category_id, name }) => [category_id, name])),
        [categories],
    );

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
        categoryNames,
        filtersKey,
        feedIndex,
        saveFeedIndex,
        selectCategory,
        openProduct,
        openCreateProduct,
        openOwner,
        openRouteTo,
        openOffer,
    };
};
