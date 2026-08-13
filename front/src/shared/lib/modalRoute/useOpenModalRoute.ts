import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { buildModalRoutePath, type TModalRoute } from './modalRoute';

/**
 * Возвращает обработчик открытия модального окна через путь react-router
 * (`/auth`, `/product/:productId/offer` и т.п.).
 *
 * Текущая страница уходит в {@code backgroundLocation}: пока в адресе стоит
 * путь модалки, под ней остаётся та же страница, и закрытие возвращает ровно
 * на неё — вместе с прокруткой, вкладкой и фильтрами в query.
 *
 * @returns Функция открытия модального окна.
 */
export const useOpenModalRoute = () => {
    const location = useLocation();
    const navigate = useNavigate();

    return useCallback(
        (route: TModalRoute) => {
            navigate(buildModalRoutePath(route), {
                state: { backgroundLocation: location },
            });
        },
        [location, navigate],
    );
};
