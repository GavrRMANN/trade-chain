import { describe, expect, it } from 'vitest';

import type { TChain } from '../types';
import { groupChainsByGoal } from './groupChainsByGoal';

const ME = 'me';

const makeChain = (chain: Partial<TChain> & Pick<TChain, 'chain_id'>): TChain => ({
    from_product_id: 'from',
    initiator_id: ME,
    status: 'pending',
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
    ...chain,
});

describe('groupChainsByGoal', () => {
    it('собирает конкурирующие предложения одной цели в одну группу', () => {
        const groups = groupChainsByGoal(
            [
                makeChain({ chain_id: 'a', exchange_goal_id: 'goal', to_product_id: 'x' }),
                makeChain({ chain_id: 'b', exchange_goal_id: 'goal', to_product_id: 'y' }),
            ],
            ME,
        );

        expect(groups).toHaveLength(1);
        expect(groups[0].offersCount).toBe(2);
        expect(groups[0].openOffersCount).toBe(2);
    });

    it('не считает чужие входящие предложения маршрутом пользователя', () => {
        const groups = groupChainsByGoal(
            [makeChain({ chain_id: 'a', initiator_id: 'someone-else', to_product_id: 'x' })],
            ME,
        );

        expect(groups).toEqual([]);
    });

    it('берёт цель из to_product_id, если exchange_goal_id ещё не заполнен', () => {
        const groups = groupChainsByGoal([makeChain({ chain_id: 'a', to_product_id: 'x' })], ME);

        expect(groups[0].goalId).toBe('x');
    });

    it('текущим товаром считает route_step_id самой свежей цепочки', () => {
        const groups = groupChainsByGoal(
            [
                makeChain({
                    chain_id: 'old',
                    exchange_goal_id: 'goal',
                    route_step_id: 'step-1',
                    updated_at: '2026-08-01T00:00:00Z',
                }),
                makeChain({
                    chain_id: 'new',
                    exchange_goal_id: 'goal',
                    route_step_id: 'step-2',
                    updated_at: '2026-08-05T00:00:00Z',
                }),
            ],
            ME,
        );

        expect(groups[0].sourceProductId).toBe('step-2');
    });

    it('предыдущим шагом берёт самый свежий завершённый обмен', () => {
        const groups = groupChainsByGoal(
            [
                makeChain({
                    chain_id: 'done-early',
                    exchange_goal_id: 'goal',
                    status: 'completed',
                    updated_at: '2026-08-02T00:00:00Z',
                }),
                makeChain({
                    chain_id: 'done-late',
                    exchange_goal_id: 'goal',
                    status: 'completed',
                    updated_at: '2026-08-06T00:00:00Z',
                }),
                makeChain({
                    chain_id: 'open',
                    exchange_goal_id: 'goal',
                    updated_at: '2026-08-07T00:00:00Z',
                }),
            ],
            ME,
        );

        expect(groups[0].previousChainId).toBe('done-late');
        expect(groups[0].completedOffersCount).toBe(2);
        expect(groups[0].openOffersCount).toBe(1);
    });

    it('различает цель-категорию и цель-товар', () => {
        const groups = groupChainsByGoal(
            [makeChain({ chain_id: 'a', to_category_id: 'category-tech' })],
            ME,
        );

        expect(groups[0].goalId).toBe('category-tech');
        expect(groups[0].goalCategoryId).toBe('category-tech');
    });

    it('сортирует цели по свежести', () => {
        const groups = groupChainsByGoal(
            [
                makeChain({
                    chain_id: 'a',
                    exchange_goal_id: 'old-goal',
                    updated_at: '2026-08-01T00:00:00Z',
                }),
                makeChain({
                    chain_id: 'b',
                    exchange_goal_id: 'fresh-goal',
                    updated_at: '2026-08-09T00:00:00Z',
                }),
            ],
            ME,
        );

        expect(groups.map(({ goalId }) => goalId)).toEqual(['fresh-goal', 'old-goal']);
    });
});
