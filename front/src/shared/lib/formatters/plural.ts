/** Формы слова для 1, 2 и 5: «товар», «товара», «товаров». */
export type TPluralForms = [one: string, few: string, many: string];

/**
 * Возвращает форму слова, согласованную с числом по правилам русского языка.
 * @param count Число, с которым согласуется слово.
 * @param forms Формы для 1, 2 и 5: например `['товар', 'товара', 'товаров']`.
 * @returns Подходящая форма слова, без самого числа.
 */
export const plural = (count: number, forms: TPluralForms): string => {
    const absolute = Math.abs(Math.trunc(count));
    const lastTwo = absolute % 100;
    const last = absolute % 10;

    // 11–14 выбиваются из общего правила: «11 товаров», а не «11 товар».
    if (lastTwo >= 11 && lastTwo <= 14) {
        return forms[2];
    }
    if (last === 1) {
        return forms[0];
    }
    if (last >= 2 && last <= 4) {
        return forms[1];
    }

    return forms[2];
};

/**
 * Собирает число вместе с согласованной формой слова.
 * @param count Число.
 * @param forms Формы для 1, 2 и 5.
 * @returns Строка вида «3 товара».
 */
export const pluralize = (count: number, forms: TPluralForms): string =>
    `${count} ${plural(count, forms)}`;
