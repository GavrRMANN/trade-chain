import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TUser, TUserProfile } from '../types';
import { getUserLocalStorage, removeUserLocalStorage, setUserLocalStorage } from '../lib';
import { getAuthToken, removeAuthToken, setAuthToken } from '@/shared/api';

type TUserState = {
    isInit: boolean;
    user: TUserProfile | undefined;
    /** Текущий токен авторизации. Источник истины для react-route-гейтов. */
    token: string | null;
};

const initialState: TUserState = {
    isInit: false,
    user: undefined,
    // Токен инициализируется экшеном initAuth при старте приложения (main.tsx),
    // а не при загрузке модуля — чтобы импорт slice был безопасен в окружениях
    // без localStorage (тесты, SSR).
    token: null,
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        initUser: (state) => {
            const user = getUserLocalStorage();

            state.user = user ? user : undefined;

            state.isInit = true;
        },
        /** Гидрирует токен из localStorage в Redux-state при старте приложения. */
        initAuth: (state) => {
            state.token = getAuthToken();
        },
        /** Сохраняет токен авторизации: и в Redux-state, и в localStorage. */
        setCredentials: (state, action: PayloadAction<string>) => {
            state.token = action.payload;

            setAuthToken(action.payload);
        },
        logout: (state) => {
            state.token = null;
            state.user = undefined;

            removeAuthToken();
            removeUserLocalStorage();
        },
        setUserProfileData: (state, action: PayloadAction<TUser>) => {
            state.user = action.payload;

            setUserLocalStorage(state.user);
        },
        clearUserProfileData: (state) => {
            state.user = undefined;
            removeUserLocalStorage();
        },
    },
    selectors: {
        // createSlice-селекторы получают уже извлечённый slice-state.
        selectorUserIsInit: (state) => state.isInit,
        selectorUserData: (state) => state.user,
        /** Токен авторизации (null, если пользователь не вошёл). */
        selectAuthToken: (state) => state.token,
        /** Признак авторизации для route-gейтов и skip-флагов запросов. */
        selectIsAuthenticated: (state) => state.token !== null,
    },
});

export const {
    initUser,
    initAuth,
    setCredentials,
    logout,
    setUserProfileData,
    clearUserProfileData,
} = userSlice.actions;

export const {
    selectorUserIsInit,
    selectorUserData,
    selectAuthToken,
    selectIsAuthenticated,
} = userSlice.selectors;
