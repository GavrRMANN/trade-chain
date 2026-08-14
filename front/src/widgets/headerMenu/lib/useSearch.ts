import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGetCategoriesQuery } from '@entities/category';
import { useLazyGetProductsQuery } from '@entities/product';

export type TUseSearchProps = {
    initialValue: string;
};

export type TUseSearchReturn = {
    value: string;
    setValue: (value: string) => void;
    search: () => void;
    isLoading: boolean;
    isError: boolean;
    suggestions: TSearchSuggestion[];
    selectSuggestion: (suggestion: TSearchSuggestion) => void;
};

export type TSearchSuggestion = {
    id: string;
    label: string;
    type: 'product' | 'category';
    categoryId?: string;
};

type TSearchState = {
    value: string;
    selectedSuggestion: TSearchSuggestion | null;
    productSuggestions: TSearchSuggestion[];
    showDefaultSuggestions: boolean;
};

type TSearchAction =
    | { type: 'setValue'; value: string }
    | { type: 'setProductSuggestions'; suggestions: TSearchSuggestion[] }
    | { type: 'showDefaultSuggestions'; value: boolean }
    | { type: 'selectSuggestion'; suggestion: TSearchSuggestion };

const searchReducer = (state: TSearchState, action: TSearchAction): TSearchState => {
    switch (action.type) {
        case 'setValue':
            return {
                ...state,
                value: action.value,
                selectedSuggestion: null,
                showDefaultSuggestions: false,
            };
        case 'setProductSuggestions':
            return { ...state, productSuggestions: action.suggestions };
        case 'showDefaultSuggestions':
            return { ...state, showDefaultSuggestions: action.value };
        case 'selectSuggestion':
            return {
                ...state,
                value: action.suggestion.label,
                selectedSuggestion: action.suggestion,
            };
    }
};

export const useSearch = ({ initialValue }: TUseSearchProps): TUseSearchReturn => {
    const navigate = useNavigate();
    const [{ value, selectedSuggestion, productSuggestions, showDefaultSuggestions }, dispatch] =
        useReducer(searchReducer, {
            value: initialValue,
            selectedSuggestion: null,
            productSuggestions: [],
            showDefaultSuggestions: false,
        });
    const [searchProducts, { isFetching, isError }] = useLazyGetProductsQuery();
    const { data: categories = [] } = useGetCategoriesQuery();
    const activeRequest = useRef<ReturnType<typeof searchProducts> | null>(null);

    const setSearchValue = useCallback((nextValue: string) => {
        dispatch({ type: 'setValue', value: nextValue });
    }, []);

    useEffect(() => {
        const query = value.trim();

        activeRequest.current?.abort();

        if ((query.length < 1 && !showDefaultSuggestions) || selectedSuggestion) {
            dispatch({ type: 'setProductSuggestions', suggestions: [] });
            return;
        }

        const timeoutId = window.setTimeout(() => {
            const request = searchProducts({
                ...(query ? { q: query } : {}),
                offset: 0,
                limit: 8,
            });
            activeRequest.current = request;

            void request
                .unwrap()
                .then((products) => {
                    dispatch({
                        type: 'setProductSuggestions',
                        suggestions: products.map((product) => ({
                            id: product.product_id,
                            label: product.title,
                            type: 'product' as const,
                            categoryId: product.category_id,
                        })),
                    });
                })
                .catch(() => {
                    dispatch({ type: 'setProductSuggestions', suggestions: [] });
                });
        }, 300);

        return () => {
            window.clearTimeout(timeoutId);
            activeRequest.current?.abort();
        };
    }, [searchProducts, selectedSuggestion, showDefaultSuggestions, value]);

    const search = useCallback(() => {
        const query = value.trim();

        activeRequest.current?.abort();

        if (!query) {
            dispatch({ type: 'showDefaultSuggestions', value: true });
            navigate('/');
            return;
        }

        dispatch({ type: 'showDefaultSuggestions', value: false });

        if (selectedSuggestion?.type === 'category' && selectedSuggestion.categoryId) {
            navigate(`/?category_id=${encodeURIComponent(selectedSuggestion.categoryId)}`);
            return;
        }

        navigate(`/?q=${encodeURIComponent(query)}`);
    }, [navigate, selectedSuggestion, value]);

    const selectSuggestion = useCallback(
        (suggestion: TSearchSuggestion) => {
            activeRequest.current?.abort();
            dispatch({ type: 'selectSuggestion', suggestion });

            if (suggestion.type === 'category' && suggestion.categoryId) {
                navigate(`/?category_id=${encodeURIComponent(suggestion.categoryId)}`);
                return;
            }

            navigate(`/?q=${encodeURIComponent(suggestion.label)}`);
        },
        [navigate],
    );

    useEffect(
        () => () => {
            activeRequest.current?.abort();
        },
        [],
    );

    return {
        value,
        setValue: setSearchValue,
        search,
        isLoading: isFetching,
        isError,
        suggestions: [
            ...categories
                .filter((category) =>
                    category.name
                        .toLocaleLowerCase('ru-RU')
                        .includes(value.trim().toLocaleLowerCase('ru-RU')),
                )
                .map((category) => ({
                    id: category.category_id,
                    label: category.name,
                    type: 'category' as const,
                    categoryId: category.category_id,
                })),
            ...productSuggestions,
        ],
        selectSuggestion,
    };
};
