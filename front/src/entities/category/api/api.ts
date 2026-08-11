import { createApi } from '@reduxjs/toolkit/query/react';
import { apiBaseQuery } from '@shared/api';
import type {
    TCategory,
    TCreateCategoryRequest,
    TUpdateCategoryRequest,
} from '../types';

type TUpdateCategoryArgs = {
    categoryId: string;
    data: TUpdateCategoryRequest;
};

export const categoryApi = createApi({
    reducerPath: 'categoryApi',
    baseQuery: apiBaseQuery,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
    endpoints: (builder) => ({
        getCategories: builder.query<TCategory[], void>({
            query: () => '/categories',
        }),
        getCategory: builder.query<TCategory, string>({
            query: (categoryId) => `/categories/${categoryId}`,
        }),
        getSubcategories: builder.query<TCategory[], string>({
            query: (categoryId) => `/categories/${categoryId}/subcategories`,
        }),
        createCategory: builder.mutation<TCategory, TCreateCategoryRequest>({
            query: (body) => ({url: '/categories', method: 'POST', body}),
        }),
        updateCategory: builder.mutation<TCategory, TUpdateCategoryArgs>({
            query: ({categoryId, data}) => ({
                url: `/categories/${categoryId}`,
                method: 'PUT',
                body: data,
            }),
        }),
        deleteCategory: builder.mutation<void, string>({
            query: (categoryId) => ({
                url: `/categories/${categoryId}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useGetCategoryQuery,
    useGetSubcategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoryApi;
