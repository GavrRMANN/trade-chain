import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getApiBaseUrl } from './config';

/** Общий HTTP-клиент API с передачей JWT из localStorage. */
export const apiBaseQuery = fetchBaseQuery({
    baseUrl: `${getApiBaseUrl()}/api/v1`,
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('token');

        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        return headers;
    },
});
