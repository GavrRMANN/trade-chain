import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAppSelector } from '@app/redux';
import { selectIsAuthenticated } from '@entities/user';

/**
 * Гейт для роутов, доступных только авторизованным пользователям.
 *
 * Неавторизованного гостя редиректит на путь {@code /auth} с фоновой локацией
 * {@code /} (публичный каталог). Модальная маршрутная система (routes.tsx)
 * отрендерит окно входа поверх каталога. После успешного входа useAuthForm
 * возвращает пользователя на путь из {@code state.authReturn} — то есть на
 * изначально запрошенный защищённый маршрут.
 *
 * Источник истины — реактивный селектор {@link selectIsAuthenticated}, поэтому
 * login/logout сразу перерисовывают гейт без перезагрузки страницы.
 */
export const ProtectedRoute = () => {
    const location = useLocation();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/auth"
                replace
                state={{
                    // Каталог как фон: всегда валидная публичная страница под модалкой.
                    backgroundLocation: { pathname: '/', search: '', hash: '' },
                    // Куда вернуться после успешного входа.
                    authReturn: {
                        pathname: location.pathname,
                        search: location.search,
                        hash: location.hash,
                    },
                }}
            />
        );
    }

    return <Outlet />;
};
