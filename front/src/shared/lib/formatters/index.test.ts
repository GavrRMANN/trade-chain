import { describe, expect, it } from 'vitest';

import { formatAmount, formatDate, pluralize } from './index';

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

describe('pluralize', () => {
    const forms: [string, string, string] = ['товар', 'товара', 'товаров'];

    it('согласует слово с числом', () => {
        expect(pluralize(0, forms)).toBe('0 товаров');
        expect(pluralize(1, forms)).toBe('1 товар');
        expect(pluralize(3, forms)).toBe('3 товара');
        expect(pluralize(7, forms)).toBe('7 товаров');
    });

    it('обрабатывает исключение для 11–14', () => {
        expect(pluralize(11, forms)).toBe('11 товаров');
        expect(pluralize(14, forms)).toBe('14 товаров');
        expect(pluralize(21, forms)).toBe('21 товар');
        expect(pluralize(112, forms)).toBe('112 товаров');
    });
});

describe('formatAmount', () => {
    it('форматирует сумму в рублях без копеек', () => {
        expect(formatAmount(1250000)).toBe('1\u00a0250\u00a0000\u00a0₽');
        expect(formatAmount(1250.75)).toBe('1\u00a0251\u00a0₽');
    });
});
