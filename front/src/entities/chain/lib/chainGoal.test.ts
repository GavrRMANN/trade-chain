import { describe, expect, it } from 'vitest';

import type { TChain } from '../types';
import { getChainGoalId, isRouteChain } from './chainGoal';

const makeChain = (chain: Partial<TChain>): TChain => ({
    chain_id: 'chain',
    from_product_id: 'from',
    initiator_id: 'me',
    status: 'pending',
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
    ...chain,
});

describe('getChainGoalId', () => {
    it('берёт цель маршрута раньше товара назначения', () => {
        expect(getChainGoalId(makeChain({ exchange_goal_id: 'goal', to_product_id: 'step' }))).toBe(
            'goal',
        );
    });

    it('берёт цель-категорию, когда путь ведёт к категории', () => {
        expect(
            getChainGoalId(makeChain({ to_category_id: 'category', to_product_id: 'step' })),
        ).toBe('category');
    });

    it('для прямого предложения целью остаётся его товар назначения', () => {
        expect(getChainGoalId(makeChain({ to_product_id: 'step' }))).toBe('step');
    });
});

describe('isRouteChain', () => {
    it('относит к цепочке обмен с целью-товаром и с целью-категорией', () => {
        expect(isRouteChain(makeChain({ exchange_goal_id: 'goal' }))).toBe(true);
        expect(isRouteChain(makeChain({ to_category_id: 'category' }))).toBe(true);
    });

    /* Иначе цепочкой оказался бы каждый прямой обмен: товар назначения есть
       у любого предложения. */
    it('не считает цепочкой прямое предложение', () => {
        expect(isRouteChain(makeChain({ to_product_id: 'step' }))).toBe(false);
    });
});
