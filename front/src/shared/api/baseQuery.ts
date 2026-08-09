import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getApiBaseUrl } from './config';
import { getAuthToken } from './tokenStorage';

/** Общий HTTP-клиент API с передачей JWT в авторизованных запросах. */
export const apiBaseQuery = fetchBaseQuery({
    baseUrl: `${getApiBaseUrl()}/api/v1`,
    prepareHeaders: (headers) => {
        const token = getAuthToken();

        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        return headers;
    },
});
