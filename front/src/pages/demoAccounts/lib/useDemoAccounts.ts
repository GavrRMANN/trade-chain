import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useGetCustomersOverviewQuery } from '@entities/customer';
import { setCredentials, useDemoLoginUserMutation } from '@entities/user';
import { parseApiError } from '@shared/api';
import { useAppDispatch } from '@app/redux';
import { getBackgroundRoute } from '@features/auth';

import { DEMO_PROFILES } from './demoProfiles';

/** Потолок выдачи участников на бэкенде. */
const PARTICIPANTS_LIMIT = 100;

/** Управляет витриной демонстрационных профилей и входом под ними. */
export const useDemoAccounts = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const reduxDispatch = useAppDispatch();
    const [pendingCustomerId, setPendingCustomerId] = useState<string>();

    const { data: participants = [], isLoading } = useGetCustomersOverviewQuery({
        limit: PARTICIPANTS_LIMIT,
    });
    const [demoLogin, { error: signInError }] = useDemoLoginUserMutation();

    /* Роль и подпись сценария живут в коде, а показатели профиля — на
       бэкенде. Карточка собирается из обоих источников, но остаётся
       видимой, даже если участник в выдаче не нашёлся. */
    const profiles = DEMO_PROFILES.map((profile) => ({
        ...profile,
        overview: participants.find(({ customer_id }) => customer_id === profile.customerId),
    }));

    const signInAs = async (customerId: string) => {
        setPendingCustomerId(customerId);

        try {
            const response = await demoLogin({ customer_id: customerId }).unwrap();

            reduxDispatch(setCredentials(response.token));
            navigate(getBackgroundRoute(location), { replace: true });
        } catch {
            // Текст ошибки берётся из состояния мутации — свой стейт раздвоил
            // бы источник правды.
        } finally {
            setPendingCustomerId(undefined);
        }
    };

    return {
        profiles,
        isLoading,
        pendingCustomerId,
        signInError: signInError ? parseApiError(signInError) : undefined,
        signInAs,
    };
};
