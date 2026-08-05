import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TUser, TUserProfile } from '../types';
import { getUserLocalStorage, removeUserLocalStorage, setUserLocalStorage } from '../lib';

type TUserState = {
    isInit: boolean;
    user: TUserProfile | undefined;
};

const initialState: TUserState = {
    isInit: false,
    user: undefined,
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
        logout: (state) => {
            state.user = undefined;
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
        selectorUserIsInit: (state) => state.isInit,
        selectorUserData: (state) => state.user,
    },
});

export const { initUser, logout, setUserProfileData, clearUserProfileData } = userSlice.actions;

export const { selectorUserIsInit, selectorUserData } = userSlice.selectors;
