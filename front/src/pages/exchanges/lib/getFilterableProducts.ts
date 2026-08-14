import type { TProduct } from '@entities/product';

import type { TExchangeRow } from './useExchangeRows';

/**
 * Товары, по которым имеет смысл фильтровать вкладку обменов.
 *
 * Бэкенд отдаёт /chains/my уже развёрнутым под зрителя (см.
 * orientChainForCustomer на бэкенде): from_product_id — всегда мой товар,
 * to_product_id — товар второй стороны, независимо от того, кто инициировал
 * цепочку. Поэтому и во входящих, и в исходящих для фильтра берём именно
 * fromProduct.
 *
 * @param tab Активная вкладка обменов.
 * @param rows Строки входящих и исходящих предложений.
 * @returns Список товаров без повторов; для остальных вкладок — пустой.
 */
export const getFilterableProducts = (
    tab: string,
    rows: { incoming: TExchangeRow[]; outgoing: TExchangeRow[] },
): TProduct[] => {
    const source = tab === 'incoming' ? rows.incoming : tab === 'outgoing' ? rows.outgoing : [];
    const byId = new Map<string, TProduct>();

    for (const row of source) {
        if (row.fromProduct) {
            byId.set(row.fromProduct.product_id, row.fromProduct);
        }
    }

    return [...byId.values()];
};
