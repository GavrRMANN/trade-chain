import type { Location } from 'react-router-dom';

import { getModalBackgroundRoute, type BackgroundRouteState } from '@shared/lib';

export type { BackgroundRouteState };
export { getModalBackgroundRoute };

/**
 * Определяет путь, на который нужно вернуться после закрытия/успешного входа
 * в модальном окне авторизации.
 *
 * Приоритет:
 *   1. {@code authReturn} — путь, сохранённый ProtectedRoute при перехвате
 *      гостя (точка возврата на изначально запрошенный защищённый маршрут).
 *   2. {@code backgroundLocation} — страница, поверх которой открыли модалку
 *      вручную (например, кнопкой «Войти» в шапке).
 *   3. {@code /} — каталог по умолчанию.
 */
export const getBackgroundRoute = (location: Location<BackgroundRouteState>) => {
    const authReturn = location.state?.authReturn;

    if (authReturn) {
        return {
            pathname: authReturn.pathname,
            search: authReturn.search,
            hash: authReturn.hash,
        };
    }

    return getModalBackgroundRoute(location);
};
