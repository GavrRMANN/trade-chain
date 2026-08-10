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

/**
 * Оставляет только цифры и добавляет пробел-разделитель тысяч.
 * Обратная операция для форматированного поля ввода цены.
 */
export const sanitizePrice = (value: string): string => {
    const digits = value.replace(/[^\d]/g, '');
    if (!digits) {
        return '';
    }
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};