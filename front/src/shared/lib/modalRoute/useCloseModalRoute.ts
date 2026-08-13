import { useCallback } from 'react';
import { useLocation, useNavigate, type Location } from 'react-router-dom';

import { getModalBackgroundRoute, type BackgroundRouteState } from './modalRoute';

/**
 * Возвращает обработчик закрытия модального окна-маршрута.
 *
 * Закрытие — это возврат на страницу под модалкой, replace-переходом: иначе
 * «назад» в браузере снова открывало бы закрытое окно.
 *
 * @param fallback Куда уйти при прямом заходе по ссылке, когда фоновой
 *   страницы в истории нет. По умолчанию — каталог.
 * @returns Функция закрытия модального окна.
 */
export const useCloseModalRoute = (fallback = '/') => {
    const location = useLocation() as Location<BackgroundRouteState>;
    const navigate = useNavigate();

    return useCallback(() => {
        navigate(getModalBackgroundRoute(location, fallback), { replace: true });
    }, [fallback, location, navigate]);
};
