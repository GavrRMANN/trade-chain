const TOKEN_STORAGE_KEY = 'token';

/** Возвращает токен авторизации из локального хранилища. */
export const getAuthToken = (): string | null => localStorage.getItem(TOKEN_STORAGE_KEY);

/** Сохраняет токен авторизации в локальном хранилище. */
export const setAuthToken = (token: string): void => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

/** Удаляет токен авторизации из локального хранилища. */
export const removeAuthToken = (): void => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
};
