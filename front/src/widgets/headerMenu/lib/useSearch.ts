import { useCallback, useEffect, useRef, useState } from 'react';
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

export const useSearch = ({
                              initialValue,
                          }: TUseSearchProps): TUseSearchReturn => {
    const navigate = useNavigate();
    const [value, setValue] = useState(initialValue);
    const [selectedSuggestion, setSelectedSuggestion] = useState<TSearchSuggestion | null>(null);
    const [productSuggestions, setProductSuggestions] = useState<TSearchSuggestion[]>([]);
    const [showDefaultSuggestions, setShowDefaultSuggestions] = useState(false);
    const [searchProducts, { isFetching, isError }] = useLazyGetProductsQuery();
    const {data: categories = []} = useGetCategoriesQuery();
    const activeRequest = useRef<ReturnType<typeof searchProducts> | null>(null);

    const setSearchValue = useCallback((nextValue: string) => {
        setValue(nextValue);
        setSelectedSuggestion(null);
        setShowDefaultSuggestions(false);
    }, []);

    useEffect(() => {
        const query = value.trim();

        activeRequest.current?.abort();

        if ((query.length < 1 && !showDefaultSuggestions) || selectedSuggestion) {
            setProductSuggestions([]);
            return;
        }

        const timeoutId = window.setTimeout(() => {
            const request = searchProducts({
                ...(query ? {q: query} : {}),
                offset: 0,
                limit: 8,
            });
            activeRequest.current = request;

            void request.unwrap()
                .then((products) => {
                    setProductSuggestions(products.map((product) => ({
                        id: product.product_id,
                        label: product.title,
                        type: 'product' as const,
                        categoryId: product.category_id,
                    })));
                })
                .catch(() => {
                    setProductSuggestions([]);
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
            setShowDefaultSuggestions(true);
            navigate('/');
            return;
        }

        setShowDefaultSuggestions(false);

        if (selectedSuggestion?.type === 'category' && selectedSuggestion.categoryId) {
            navigate(`/?category_id=${encodeURIComponent(selectedSuggestion.categoryId)}`);
            return;
        }

        navigate(`/?q=${encodeURIComponent(query)}`);
    }, [navigate, selectedSuggestion, value]);

    const selectSuggestion = useCallback((suggestion: TSearchSuggestion) => {
        activeRequest.current?.abort();
        setValue(suggestion.label);
        setSelectedSuggestion(suggestion);

        if (suggestion.type === 'category' && suggestion.categoryId) {
            navigate(`/?category_id=${encodeURIComponent(suggestion.categoryId)}`);
            return;
        }

        navigate(`/?q=${encodeURIComponent(suggestion.label)}`);
    }, [navigate]);

    useEffect(() => () => {
        activeRequest.current?.abort();
    }, []);

    return {
        value,
        setValue: setSearchValue,
        search,
        isLoading: isFetching,
        isError,
        suggestions: [
            ...categories
                .filter((category) => category.name.toLocaleLowerCase('ru-RU').includes(value.trim().toLocaleLowerCase('ru-RU')))
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
