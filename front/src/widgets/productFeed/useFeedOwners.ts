import { useMemo } from 'react';

import { useGetCustomersOverviewQuery } from '@entities/customer';
import type { TCustomerOverview } from '@entities/customer';

/**
 * Потолок выдачи участников на бэкенде. Лента показывает вещи всех
 * владельцев сразу, поэтому забирается весь список одним запросом.
 */
const PARTICIPANTS_LIMIT = 100;

/**
 * Владельцы вещей по идентификатору — для подписи карточки в ленте.
 *
 * Имя и рейтинг не приходят вместе с товаром, а запрашивать профиль на
 * каждую карточку значило бы делать запрос на каждую прокрутку. Список
 * участников небольшой и уже кэшируется другими экранами, поэтому он
 * забирается целиком и раскладывается в Map.
 */
export const useFeedOwners = ({ skip = false }: { skip?: boolean } = {}) => {
    const { data: participants = [] } = useGetCustomersOverviewQuery(
        { limit: PARTICIPANTS_LIMIT },
        { skip },
    );

    return useMemo(
        () =>
            new Map<string, TCustomerOverview>(
                participants.map((participant) => [participant.customer_id, participant]),
            ),
        [participants],
    );
};
