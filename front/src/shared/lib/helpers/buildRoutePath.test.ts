import { describe, expect, it } from 'vitest';

import { buildRoutePath } from './buildRoutePath';

describe('buildRoutePath', () => {
    it('ведёт к цели-товару вместе с текущим этапом пути', () => {
        expect(buildRoutePath({ goalId: 'goal', sourceProductId: 'current' })).toBe(
            '/route?target=goal&from=current',
        );
    });

    it('цель-категорию передаёт отдельным параметром', () => {
        expect(buildRoutePath({ goalId: 'category', goalCategoryId: 'category' })).toBe(
            '/route?targetCategory=category',
        );
    });
});
