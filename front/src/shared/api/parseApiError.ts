/**
 * Извлекает текст ошибки из объекта ошибки RTK Query / fetch.
 *
 * Ожидает структуру `{ data: { error: string } }`, которая соответствует
 * формату ответов нашего бэкенда. Если извлечь не удаётся — возвращает
 * `fallback`.
 */
export const parseApiError = (
    error: unknown,
    fallback = 'Не удалось выполнить запрос. Попробуйте ещё раз.',
): string => {
    if (typeof error === 'object' && error !== null && 'data' in error) {
        const data = error.data;
        if (
            typeof data === 'object' &&
            data !== null &&
            'error' in data &&
            typeof data.error === 'string'
        ) {
            return data.error;
        }
    }
    return fallback;
};
