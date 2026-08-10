import { describe, expect, it } from 'vitest';

import type { TProduct } from '@entities/product';
import { getProductMeta } from './useRouteBuilder';

const product = (overrides: Partial<TProduct> = {}): TProduct => ({
    product_id: 'product-1',
    customer_id: 'customer-1',
    title: 'Велосипед',
    status: 'active',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
});

describe('getProductMeta', () => {
    it('объединяет цену и местоположение', () => {
        expect(getProductMeta(product({ price: 125000, location: 'Москва' }))).toBe(
            '125 000 ₽ · Москва',
        );
    });

    it('возвращает только доступные значения', () => {
        expect(getProductMeta(product({ price: undefined, location: undefined }))).toBe('');
        expect(getProductMeta(product({ price: 5000 }))).toBe('5 000 ₽');
        expect(getProductMeta(product({ location: 'Казань' }))).toBe('Казань');
    });
});
