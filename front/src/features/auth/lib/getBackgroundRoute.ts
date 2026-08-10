import type { Location, Path } from 'react-router-dom';

export type BackgroundRouteState = {
    backgroundLocation: Path;
    /** Путь возврата после успешного входа через ProtectedRoute. */
    authReturn?: Path;
};

const getLocationPath = (path: Path) => ({
    pathname: path.pathname,
    search: path.search,
    hash: path.hash,
});

/** Возвращает страницу, поверх которой открыли модалку. */
export const getModalBackgroundRoute = (location: Location<BackgroundRouteState>) => {
    const backgroundLocation = location.state?.backgroundLocation;

    return backgroundLocation ? getLocationPath(backgroundLocation) : '/';
};

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
