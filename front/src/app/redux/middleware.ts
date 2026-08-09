import {isRejectedWithValue, type Middleware} from '@reduxjs/toolkit';
import {logout} from '@/entities/user';

/**
 * Перехватывает неудачные запросы RTK Query.
 *
 * При ответе 401 (токен недействителен/протух) выполняет логаут: очищает токен
 * из Redux/localStorage. Защищённые роуты через {@link selectIsAuthenticated}
 * реактивно показывают экран входа, а skip-флаги ({@code skip: !isAuthenticated})
 * останавливают дальнейшие запросы с устаревшими данными.
 *
 * Сброс кэша RTK Query не делается здесь намеренно: после logout селектор
 * isAuthenticated становится false, все защищённые запросы получают skip и не
 * возвращают данные, а соответствующие страницы перемонтируются в гостевой вид.
 *
 * Примечание: 401 на самих /auth/login/ register безвреден — токена ещё нет,
 * logout() оставляет состояние guest-экрана без изменений.
 *
 * Тип `unknown` для state/dispatch используется намеренно, чтобы не тянуть
 * циклический импорт типов из store.ts.
 */
export const rtkQueryAuthMiddleware: Middleware =
    (api) => (next) => (action) => {
        if (isRejectedWithValue(action)) {
            const status = (action.payload as {status?: number} | undefined)?.status;

            if (status === 401) {
                api.dispatch(logout() as never);
            }
        }

        return next(action);
    };
