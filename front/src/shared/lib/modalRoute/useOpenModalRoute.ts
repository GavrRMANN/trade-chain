import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { buildModalRoutePath, type TModalRouteEntity } from '@shared/lib';

/**
 * Возвращает обработчик открытия модального окна через путь react-router (`/clients/:id`, `/clients/new` и т.п.).
 * @returns Функция открытия модального окна.
 */
export const useOpenModalRoute = () => {
    const location = useLocation();
    const navigate = useNavigate();

    return useCallback(
        (entity: TModalRouteEntity, id?: string) => {
            navigate(buildModalRoutePath(entity, id), {
                state: { backgroundLocation: location },
            });
        },
        [location, navigate],
    );
};
