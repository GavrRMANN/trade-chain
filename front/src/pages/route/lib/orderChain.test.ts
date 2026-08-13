import { describe, expect, it } from 'vitest';

import type { TProduct } from '@entities/product';

import { orderChainForRoute } from './orderChain';

const product = (id: string): TProduct => ({
    product_id: id,
    customer_id: 'customer-1',
    title: id,
    status: 'active',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
});

const ids = (products: TProduct[]) => products.map(({ product_id }) => product_id);

describe('orderChainForRoute', () => {
    it('разворачивает путь, пришедший целью вперёд', () => {
        const chain = orderChainForRoute([product('goal'), product('middle'), product('mine')], {
            sourceId: 'mine',
            targetId: 'goal',
        });

        expect(ids(chain)).toEqual(['mine', 'middle', 'goal']);
    });

    it('оставляет путь, уже идущий от своей вещи к цели', () => {
        const chain = orderChainForRoute([product('mine'), product('middle'), product('goal')], {
            sourceId: 'mine',
            targetId: 'goal',
        });

        expect(ids(chain)).toEqual(['mine', 'middle', 'goal']);
    });

    /* Цель приходит категорией, и её товар в концах пути не назван — узнаём
       направление по стартовой вещи. */
    it('определяет направление по стартовой вещи, если цель не указана', () => {
        const chain = orderChainForRoute([product('goal'), product('mine')], {
            sourceId: 'mine',
            targetId: '',
        });

        expect(ids(chain)).toEqual(['mine', 'goal']);
    });

    it('не трогает пустой путь и путь из одной вещи', () => {
        expect(orderChainForRoute([], { sourceId: 'mine', targetId: 'goal' })).toEqual([]);
        expect(
            ids(orderChainForRoute([product('mine')], { sourceId: 'mine', targetId: 'goal' })),
        ).toEqual(['mine']);
    });

    it('не меняет исходный массив', () => {
        const source = [product('goal'), product('mine')];

        orderChainForRoute(source, { sourceId: 'mine', targetId: 'goal' });

        expect(ids(source)).toEqual(['goal', 'mine']);
    });
});
