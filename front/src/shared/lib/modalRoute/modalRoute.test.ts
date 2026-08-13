import { describe, expect, it } from 'vitest';

import { buildModalRoutePath, getModalBackgroundRoute } from './modalRoute';

describe('buildModalRoutePath', () => {
    it('строит статические пути модалок', () => {
        expect(buildModalRoutePath({ name: 'auth' })).toBe('/auth');
        expect(buildModalRoutePath({ name: 'routeBuilder' })).toBe('/exchanges/new');
        expect(buildModalRoutePath({ name: 'exchangeFilter' })).toBe('/exchanges/filter');
    });

    it('подставляет идентификатор товара', () => {
        expect(buildModalRoutePath({ name: 'offerExchange', productId: 'p-1' })).toBe(
            '/product/p-1/offer',
        );
        expect(buildModalRoutePath({ name: 'archiveProduct', productId: 'p-1' })).toBe(
            '/product/p-1/archive',
        );
    });

    it('переносит контекст маршрута в query-параметры предложения', () => {
        expect(
            buildModalRoutePath({
                name: 'offerExchange',
                productId: 'p-1',
                exchangeGoalId: 'goal-1',
                routeStepId: 'step-1',
                previousChainId: 'chain-1',
            }),
        ).toBe('/product/p-1/offer?goal=goal-1&step=step-1&prevChain=chain-1');
    });

    it('не добавляет пустые параметры контекста', () => {
        expect(
            buildModalRoutePath({
                name: 'offerExchange',
                productId: 'p-1',
                exchangeGoalId: undefined,
                goalCategoryId: 'cat-1',
            }),
        ).toBe('/product/p-1/offer?goalCategory=cat-1');
    });

    it('переносит query страницы обменов в путь фильтра', () => {
        expect(
            buildModalRoutePath({
                name: 'exchangeFilter',
                search: '?view=exchanges&tab=incoming',
            }),
        ).toBe('/exchanges/filter?view=exchanges&tab=incoming');
        expect(
            buildModalRoutePath({ name: 'exchangeFilter', search: 'view=exchanges' }),
        ).toBe('/exchanges/filter?view=exchanges');
    });
});

describe('getModalBackgroundRoute', () => {
    it('возвращает страницу под модалкой', () => {
        const route = getModalBackgroundRoute({
            pathname: '/auth',
            search: '',
            hash: '',
            key: 'test',
            state: {
                backgroundLocation: {
                    pathname: '/exchanges',
                    search: '?tab=incoming',
                    hash: '',
                },
            },
        });

        expect(route).toEqual({ pathname: '/exchanges', search: '?tab=incoming', hash: '' });
    });

    it('возвращает переданный fallback, если фоновой страницы нет', () => {
        const location = {
            pathname: '/product/p-1/offer',
            search: '',
            hash: '',
            key: 'test',
            state: null,
        };

        expect(getModalBackgroundRoute(location)).toBe('/');
        expect(getModalBackgroundRoute(location, '/product/p-1')).toBe('/product/p-1');
    });
});
