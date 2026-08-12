import {useCallback, useState} from 'react';

import {useGetCurrentUserQuery} from '@entities/user';

/**
 * Управляет модалкой предложения обмена, открытой из ленты каталога.
 *
 * Лента не знает о текущем пользователе и о том, к какому товару привязано
 * предложение: это состояние экрана, а не карточки, поэтому оно живёт здесь,
 * а CatalogPage остаётся чистой композицией.
 */
export const useFeedOffer = () => {
    const [offerProductId, setOfferProductId] = useState<string>();
    const {data: currentUser} = useGetCurrentUserQuery();

    const openOffer = useCallback((productId: string) => setOfferProductId(productId), []);
    const closeOffer = useCallback(() => setOfferProductId(undefined), []);

    return {
        offerProductId,
        currentCustomerId: currentUser?.customer_id,
        openOffer,
        closeOffer,
    };
};
