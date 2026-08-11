import {useEffect, useMemo, useRef, useState} from 'react';

import {useLazyGetProductQuery} from '../api';
import type {TProduct} from '../types';

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
    const attemptedProductIds = useRef(new Set<string>());
    const productIdsKey = [...new Set(productIds.filter((id): id is string => Boolean(id)))].sort().join(',');

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
        const missingProductIds = productIdsKey
            .split(',')
            .filter((productId) => productId && !productsById.has(productId) && !attemptedProductIds.current.has(productId));

        if (missingProductIds.length === 0) {
            return;
        }

        missingProductIds.forEach((productId) => attemptedProductIds.current.add(productId));
        let isCancelled = false;

        void Promise.all(
            missingProductIds.map((productId) => loadProduct(productId, true).unwrap().catch(() => undefined)),
        ).then((products) => {
            if (isCancelled) {
                return;
            }
            const foundProducts = products.filter((product): product is TProduct => Boolean(product));
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
