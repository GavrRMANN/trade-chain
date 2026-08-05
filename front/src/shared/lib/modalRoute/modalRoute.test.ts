import { describe, expect, it } from 'vitest';

import { buildModalRoutePath } from './modalRoute';

describe('buildModalRoutePath', () => {
    it('возвращает путь создания, если идентификатор не передан', () => {
        expect(buildModalRoutePath('clients')).toBe('/clients/new');
        expect(buildModalRoutePath('deals')).toBe('/deals/new');
        expect(buildModalRoutePath('tasks')).toBe('/tasks/new');
    });

    it('возвращает путь редактирования с идентификатором сущности', () => {
        expect(buildModalRoutePath('clients', 'client-1')).toBe('/clients/client-1');
        expect(buildModalRoutePath('deals', 'deal-42')).toBe('/deals/deal-42');
    });
});
