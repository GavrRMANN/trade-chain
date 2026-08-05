/**
 * Возвращает базовый URL API.
 * @returns Базовый URL API.
 */
export const getApiBaseUrl = (): string =>
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
