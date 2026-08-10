import {useMemo, useState} from 'react';

import type {TCategory} from '@entities/category';

export const useCategoryPicker = (
    categories: TCategory[],
    value: string,
    disabled: boolean,
    onChange: (value: string) => void,
) => {
    const [expandedParent, setExpandedParent] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const roots = useMemo(() => categories.filter((category) => !category.parent_id), [categories]);
    const children = useMemo(
        () => categories.filter((category) => category.parent_id === expandedParent),
        [categories, expandedParent],
    );
    const searchResults = useMemo(() => {
        const query = search.trim().toLowerCase();
        return query ? categories.filter((category) => category.name.toLowerCase().includes(query)) : [];
    }, [categories, search]);
    const selectedPath = useMemo(() => {
        const path: TCategory[] = [];
        let current = categories.find((category) => category.category_id === value);
        const guard = new Set<string>();
        while (current && !guard.has(current.category_id)) {
            guard.add(current.category_id);
            path.unshift(current);
            current = current.parent_id
                ? categories.find((category) => category.category_id === current?.parent_id)
                : undefined;
        }
        return path;
    }, [categories, value]);
    const expandedParentName = expandedParent
        ? categories.find((category) => category.category_id === expandedParent)?.name ?? 'Подкатегории'
        : 'Подкатегория';
    const expandedParentCategory = expandedParent
        ? categories.find((category) => category.category_id === expandedParent)
        : undefined;

    const handleExpand = (parentId: string) => {
        if (!disabled) setExpandedParent((current) => (current === parentId ? null : parentId));
    };
    const handleSelect = (category: TCategory) => {
        if (disabled) return;
        onChange(category.category_id);
        setExpandedParent(null);
        setSearch('');
    };

    return {
        expandedParent,
        search,
        setSearch,
        roots,
        children,
        searchResults,
        selectedPath,
        expandedParentName,
        expandedParentCategory,
        isSearching: search.trim().length > 0,
        handleExpand,
        handleSelect,
    };
};
