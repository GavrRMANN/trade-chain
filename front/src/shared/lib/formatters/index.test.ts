import { describe, expect, it } from 'vitest';

import { formatAmount, formatDate } from './index';

describe('formatDate', () => {
    it('возвращает прочерк для пустой даты', () => {
        expect(formatDate(undefined)).toBe('—');
    });

    it('форматирует дату в коротком и длинном вариантах', () => {
        const date = '2026-01-15T12:00:00.000Z';

        expect(formatDate(date)).toBe('15 янв. 2026 г.');
        expect(formatDate(date, 'long')).toBe('15 января 2026 г.');
        expect(formatDate(date, 'longWithoutYear')).toBe('15 января');
    });
});

describe('formatAmount', () => {
    it('форматирует сумму в рублях без копеек', () => {
        expect(formatAmount(1250000)).toBe('1\u00a0250\u00a0000\u00a0₽');
        expect(formatAmount(1250.75)).toBe('1\u00a0251\u00a0₽');
    });
});
