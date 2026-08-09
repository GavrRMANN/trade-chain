/**
 * Форматирует число как сумму в рублях.
 * @param amount Числовое значение суммы.
 * @returns Отформатированная строка суммы.
 */
export const formatAmount = (amount: number): string =>
    new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    }).format(amount);

/**
 * Форматирует число как сумму в рублях.
 * @param amount Числовое значение суммы.
 * @returns Части для отображения.
 */
export const formatToPartsAmount = (amount: number): Intl.NumberFormatPart[] =>
    new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    }).formatToParts(amount);