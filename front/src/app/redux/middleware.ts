import { isAnyOf, isRejectedWithValue, type Middleware } from '@reduxjs/toolkit';
import { categoryApi } from '@/entities/category';
import { chainApi } from '@/entities/chain';
import { customerApi } from '@/entities/customer';
import { productApi } from '@/entities/product';
import { reviewApi } from '@/entities/review';
import { searchApi } from '@/entities/search';
import { logout, setCredentials, userApi } from '@/entities/user';
import { wishlistApi } from '@/entities/wishlist';
import { notificationApi } from '@/entities/notification/api';

const apiSlices = [
    userApi,
    productApi,
    categoryApi,
    chainApi,
    customerApi,
    reviewApi,
    searchApi,
    wishlistApi,
    notificationApi,
];

/**
 * Синхронизирует кэш RTK Query при смене сессии и межсущностных изменениях.
 *
 * При смене сессии очищает кеши RTK Query, чтобы ответы с прежним токеном не
 * были показаны новому пользователю. Это применяется и к logout, и к успешному
 * login/register через setCredentials.
 *
 * При ответе 401 (токен недействителен/протух) выполняет логаут: очищает токен
 * из Redux/localStorage и все кеши RTK Query.
 *
 * Примечание: 401 на самих /auth/login/ register безвреден — токена ещё нет,
 * logout() оставляет состояние guest-экрана без изменений.
 *
 * Тип `unknown` для state/dispatch используется намеренно, чтобы не тянуть
 * циклический импорт типов из store.ts.
 */
export const rtkQueryCacheMiddleware: Middleware = (api) => (next) => (action) => {
    if (isAnyOf(setCredentials, logout)(action)) {
        for (const apiSlice of apiSlices) {
            api.dispatch(apiSlice.util.resetApiState());
        }
    }

    if (isRejectedWithValue(action)) {
        const status = (action.payload as { status?: number } | undefined)?.status;

        if (status === 401) {
            api.dispatch(logout() as never);
        }
    }

    const result = next(action);

    if (chainApi.endpoints.confirmChain.matchFulfilled(action)) {
        api.dispatch(productApi.util.invalidateTags(['Product']));
    }

    return result;
};
