import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getApiBaseUrl } from '@shared/api';
import type {
    Category,
    TCreateCategoryRequest,
    TUpdateCategoryRequest,
} from '../types';

type TUpdateCategoryArgs = {
    categoryId: string;
    data: TUpdateCategoryRequest;
};

export const categoryApi = createApi({
    reducerPath: 'categoryApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${getApiBaseUrl()}/api/v1`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getCategories: builder.query<Category[], void>({
            query: () => '/categories',
        }),
        getCategory: builder.query<Category, string>({
            query: (categoryId) => `/categories/${categoryId}`,
        }),
        getSubcategories: builder.query<Category[], string>({
            query: (categoryId) => `/categories/${categoryId}/subcategories`,
        }),
        createCategory: builder.mutation<Category, TCreateCategoryRequest>({
            query: (body) => ({url: '/categories', method: 'POST', body}),
        }),
        updateCategory: builder.mutation<Category, TUpdateCategoryArgs>({
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
