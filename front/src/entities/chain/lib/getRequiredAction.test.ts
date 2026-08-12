import { describe, expect, it } from 'vitest';

import type { TChain } from '../types';
import { getRequiredAction } from './getRequiredAction';

const ME = 'me';
const PARTNER = 'partner';

const makeChain = (chain: Partial<TChain> = {}): TChain => ({
    chain_id: 'chain',
    from_product_id: 'from',
    to_product_id: 'to',
    initiator_id: ME,
    status: 'pending',
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
    ...chain,
});

describe('getRequiredAction', () => {
    it('инициатору ожидающего предложения говорит ждать, а не действовать', () => {
        const action = getRequiredAction({ chain: makeChain(), currentUserId: ME });

        expect(action.actor).toBe('partner');
    });

    it('получателю того же предложения говорит ответить', () => {
        const action = getRequiredAction({
            chain: makeChain({ initiator_id: PARTNER }),
            currentUserId: ME,
        });

        expect(action).toEqual({
            text: 'Ответьте на предложение: принять или отклонить',
            actor: 'you',
        });
    });

    it('показывает срок ответа, когда он задан', () => {
        const action = getRequiredAction({
            chain: makeChain({ expires_at: '2026-08-20T14:30:00Z' }),
            currentUserId: ME,
        });

        expect(action.text).toContain('20 августа');
    });

    it('после своего подтверждения переводит ожидание на вторую сторону', () => {
        const action = getRequiredAction({
            chain: makeChain({ status: 'active' }),
            currentUserId: ME,
            confirmations: [
                { customer_id: ME, result: 'success', created_at: '2026-08-02T00:00:00Z' },
            ],
        });

        expect(action).toEqual({ text: 'Ждём подтверждения второго участника', actor: 'partner' });
    });

    it('просит подтвердить результат, когда подтвердила только вторая сторона', () => {
        const action = getRequiredAction({
            chain: makeChain({ status: 'active' }),
            currentUserId: ME,
            confirmations: [
                { customer_id: PARTNER, result: 'success', created_at: '2026-08-02T00:00:00Z' },
            ],
        });

        expect(action).toEqual({ text: 'Подтвердите, состоялся ли обмен', actor: 'you' });
    });

    it('в принятом обмене без подтверждений ведёт к согласованию встречи', () => {
        const action = getRequiredAction({
            chain: makeChain({ status: 'active' }),
            currentUserId: ME,
            confirmations: [],
        });

        expect(action).toEqual({ text: 'Согласуйте место и время встречи', actor: 'you' });
    });

    it('для недоступного товара предлагает перестроить маршрут', () => {
        const action = getRequiredAction({
            chain: makeChain({ status: 'unavailable' }),
            currentUserId: ME,
        });

        expect(action.text).toContain('Перестроить маршрут');
    });

    it('покрывает все статусы цепочки непустым требованием', () => {
        const statuses: TChain['status'][] = [
            'pending',
            'active',
            'completed',
            'cancelled',
            'rejected',
            'countered',
            'failed',
            'expired',
            'unavailable',
        ];

        for (const status of statuses) {
            const action = getRequiredAction({ chain: makeChain({ status }), currentUserId: ME });
            expect(action.text.length).toBeGreaterThan(0);
        }
    });
});
