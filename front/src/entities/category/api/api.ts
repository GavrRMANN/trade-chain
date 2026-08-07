import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getApiBaseUrl } from '@shared/api';
import type { Category, TCategoryListRequest } from '../types';

export const categoryApi = createApi({
    reducerPath: 'categoryApi',
    baseQuery: fetchBaseQuery({ baseUrl: `${getApiBaseUrl()}/api/v1` }),
    endpoints: (builder) => ({
        getCategories: builder.query<Category[], TCategoryListRequest | void>({
            query: (params) => ({
                url: '/categories',
                ...(params ? { params } : {}),
            }),
        }),
        getCategory: builder.query<Category, string>({
            query: (categoryId) => `/categories/${categoryId}`,
        }),
    }),
});

export const { useGetCategoriesQuery, useGetCategoryQuery } = categoryApi;
