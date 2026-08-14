import { describe, expect, it } from 'vitest';

import { getBackgroundRoute, getModalBackgroundRoute } from './getBackgroundRoute';

describe('getBackgroundRoute', () => {
    it('возвращает маршрут, с которого открыли модальное окно', () => {
        const route = getBackgroundRoute({
            state: {
                backgroundLocation: {
                    pathname: '/catalog',
                    search: '?q=велосипед',
                    hash: '#results',
                },
            },
        } as never);

        expect(route).toEqual({
            pathname: '/catalog',
            search: '?q=велосипед',
            hash: '#results',
        });
    });

    it('возвращает корень без фонового маршрута', () => {
        expect(getBackgroundRoute({ state: undefined } as never)).toBe('/');
    });

    it('для закрытия модалки игнорирует маршрут возврата после авторизации', () => {
        const route = getModalBackgroundRoute({
            state: {
                backgroundLocation: { pathname: '/', search: '', hash: '' },
                authReturn: { pathname: '/profile', search: '', hash: '' },
            },
        } as never);

        expect(route).toEqual({ pathname: '/', search: '', hash: '' });
    });
});
