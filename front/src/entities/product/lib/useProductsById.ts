import { useEffect, useMemo, useRef, useState } from 'react';

import { useLazyGetProductQuery } from '../api';
import type { TProduct } from '../types';

/** Сервер ответил 404 — товара точно не существует, а не временная ошибка сети. */
const isNotFoundError = (error: unknown): boolean =>
    typeof error === 'object' && error !== null && 'status' in error && error.status === 404;

/**
 * Дополняет каталог товарами, недоступными в общем списке, но связанными с историей.
 *
 * @param productIds Идентификаторы товаров, которые нужны экрану.
 * @param availableProducts Товары, уже загруженные из каталога или другого источника.
 * @returns Товары, доступные по идентификатору.
 */
export const useProductsById = (
    productIds: readonly (string | undefined)[],
    availableProducts: readonly TProduct[],
): Map<string, TProduct> => {
    const [loadProduct] = useLazyGetProductQuery();
    const [loadedProducts, setLoadedProducts] = useState<TProduct[]>([]);
    // Только подтверждённое 404 — товар удалён, и спрашивать о нём снова незачем.
    // Сетевой сбой или таймаут в этот список не попадает: иначе временная ошибка
    // на старте страницы навсегда клеймила бы существующий товар «недоступным».
    const missingProductIds = useRef(new Set<string>());
    const productIdsKey = [...new Set(productIds.filter((id): id is string => Boolean(id)))]
        .sort()
        .join(',');

    const productsById = useMemo(() => {
        const map = new Map<string, TProduct>();
        for (const product of loadedProducts) {
            map.set(product.product_id, product);
        }
        for (const product of availableProducts) {
            map.set(product.product_id, product);
        }
        return map;
    }, [availableProducts, loadedProducts]);

    useEffect(() => {
        const idsToLoad = productIdsKey
            .split(',')
            .filter(
                (productId) =>
                    productId &&
                    !productsById.has(productId) &&
                    !missingProductIds.current.has(productId),
            );

        if (idsToLoad.length === 0) {
            return;
        }

        let isCancelled = false;

        void Promise.all(
            idsToLoad.map((productId) =>
                loadProduct(productId, true)
                    .unwrap()
                    .catch((error) => {
                        if (isNotFoundError(error)) {
                            missingProductIds.current.add(productId);
                        }
                        return undefined;
                    }),
            ),
        ).then((products) => {
            if (isCancelled) {
                return;
            }
            const foundProducts = products.filter((product): product is TProduct =>
                Boolean(product),
            );
            if (foundProducts.length > 0) {
                setLoadedProducts((current) => [...current, ...foundProducts]);
            }
        });

        return () => {
            isCancelled = true;
        };
    }, [loadProduct, productIdsKey, productsById]);

    return productsById;
};
