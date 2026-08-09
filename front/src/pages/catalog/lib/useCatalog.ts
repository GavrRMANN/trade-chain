import {useGetCategoriesQuery} from '@entities/category';
import {useGetProductsQuery} from '@entities/product';
import {usePageTitle} from '@app/providers/pageTitle';
import {useEffect, useLayoutEffect, useMemo} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';

type TCatalogCategory = {
    id: string;
    title: string;
    image?: string;
};

/** Управляет данными, фильтром и навигацией каталога. */
export const useCatalog = () => {
    const {setTitle} = usePageTitle();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const searchQuery = searchParams.get('q')?.trim() ?? '';
    const categoryQuery = searchParams.get('category_id')?.trim() ?? '';

    const {data: categories = [], isLoading: isCategoriesLoading, isError: isCategoriesError} = useGetCategoriesQuery();

    const categoryFilters = useMemo<TCatalogCategory[]>(() => [
        {id: 'all', title: 'Все'},
        ...categories.map(({category_id, name, image}) => ({id: category_id, title: name, image})),
    ], [categories]);

    const {
        data,
        isLoading,
        isFetching,
        isError,
    } = useGetProductsQuery({
        offset: 0,
        limit: 20,
        ...(searchQuery ? {q: searchQuery} : {}),
        ...(categoryQuery ? {category_id: categoryQuery} : {}),
    });

    useEffect(() => {
        if (categoryQuery && !categoryFilters.some(({id}) => id === categoryQuery)) {
            setSearchParams((currentParams) => {
                currentParams.delete('category_id');
                return currentParams;
            }, {replace: true});
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
        setSearchParams((currentParams) => {
            if (categoryId === 'all') {
                currentParams.delete('category_id');
            } else {
                currentParams.set('category_id', categoryId);
            }

            return currentParams;
        }, {replace: true});
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
        products: data,
        isLoading,
        isFetching,
        isError,
        isCategoriesLoading,
        isCategoriesError,
        selectCategory,
        openProduct,
        openCreateProduct,
    };
};
