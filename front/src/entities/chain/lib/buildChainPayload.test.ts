import { describe, expect, it } from 'vitest';

import { buildChainPayload } from './buildChainPayload';

describe('buildChainPayload', () => {
    it('без контекста маршрута собирает обычное прямое предложение', () => {
        expect(
            buildChainPayload({
                fromProductId: 'my-bike',
                toProductId: 'console',
                message: '  готов встретиться в центре  ',
            }),
        ).toEqual({
            from_product_id: 'my-bike',
            to_product_id: 'console',
            status: 'pending',
            message: 'готов встретиться в центре',
        });
    });

    it('не отправляет пустое сообщение', () => {
        const payload = buildChainPayload({
            fromProductId: 'my-bike',
            toProductId: 'console',
            message: '   ',
        });

        expect(payload).not.toHaveProperty('message');
    });

    it('привязывает предложение к цели-товару, текущему этапу и предыдущему шагу', () => {
        expect(
            buildChainPayload({
                fromProductId: 'my-guitar',
                toProductId: 'laptop',
                routeContext: {
                    exchangeGoalId: 'goal-car',
                    routeStepId: 'my-guitar',
                    previousChainId: 'chain-1',
                },
            }),
        ).toEqual({
            from_product_id: 'my-guitar',
            to_product_id: 'laptop',
            status: 'pending',
            exchange_goal_id: 'goal-car',
            route_step_id: 'my-guitar',
            previous_chain_id: 'chain-1',
        });
    });

    it('для цели-категории отправляет to_category_id вместо exchange_goal_id', () => {
        const payload = buildChainPayload({
            fromProductId: 'my-guitar',
            toProductId: 'laptop',
            routeContext: { goalCategoryId: 'category-tech', exchangeGoalId: 'ignored' },
        });

        expect(payload.to_category_id).toBe('category-tech');
        expect(payload).not.toHaveProperty('exchange_goal_id');
    });

    it('пропускает незаполненные части контекста', () => {
        const payload = buildChainPayload({
            fromProductId: 'my-guitar',
            toProductId: 'laptop',
            routeContext: { exchangeGoalId: 'goal-car' },
        });

        expect(payload).not.toHaveProperty('route_step_id');
        expect(payload).not.toHaveProperty('previous_chain_id');
    });
});
