import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useGetCustomersOverviewQuery } from '@entities/customer';
import { setCredentials, useDemoLoginUserMutation } from '@entities/user';
import { parseApiError } from '@shared/api';
import { useAppDispatch } from '@app/redux';
import { getBackgroundRoute } from '@features/auth';

/**
 * Список участников не постраничный: экран входа показывает всех сразу,
 * пролистывать людей на нём некуда. Значение — потолок бэкенда, выше него
 * сервер всё равно обрежет выдачу.
 */
const PARTICIPANTS_LIMIT = 100;

export const useUserPicker = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const reduxDispatch = useAppDispatch();

    const {
        data: participants,
        isLoading,
        error: listError,
        refetch,
    } = useGetCustomersOverviewQuery({ limit: PARTICIPANTS_LIMIT });

    const [demoLogin, { isLoading: isSigningIn, originalArgs, error: signInError }] =
        useDemoLoginUserMutation();

    const getBackgroundRouteCallback = useCallback(() => {
        return getBackgroundRoute(location);
    }, [location]);

    const signInAs = async (customerId: string) => {
        try {
            const response = await demoLogin({ customer_id: customerId }).unwrap();

            reduxDispatch(setCredentials(response.token));
            navigate(getBackgroundRouteCallback(), { replace: true });
        } catch {
            // Текст ошибки берётся из состояния мутации ниже — отдельный
            // стейт под неё только раздвоил бы источник правды.
        }
    };

    return {
        participants: participants ?? [],
        isLoading,
        isSigningIn,
        /** Участник, под которого идёт вход: спиннер показывает его карточка. */
        pendingCustomerId: isSigningIn ? (originalArgs?.customer_id ?? null) : null,
        listError: listError
            ? parseApiError(listError, 'Не удалось загрузить список участников.')
            : undefined,
        signInError: signInError ? parseApiError(signInError) : undefined,
        refetch,
        signInAs,
    };
};
