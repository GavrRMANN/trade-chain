/** Стиль отображения даты в {@link formatDate}. */
export type TDateFormatStyle = 'short' | 'long' | 'longWithoutYear';

const DATE_FORMAT_OPTIONS: Record<TDateFormatStyle, Intl.DateTimeFormatOptions> = {
    short: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    longWithoutYear: { day: 'numeric', month: 'long' },
};

/**
 * Форматирует дату в локальный формат ru-RU.
 * @param date Строка с датой или undefined.
 * @param style Стиль отображения: 'short' — «15 янв. 2026 г.», 'long' — «15 января 2026 г.», 'longWithoutYear' — «15 января».
 * @returns Отформатированная строка или прочерк.
 */
export const formatDate = (date: string | undefined, style: TDateFormatStyle = 'short'): string => {
    if (!date) {
        return '—';
    }

    return new Intl.DateTimeFormat('ru-RU', DATE_FORMAT_OPTIONS[style]).format(new Date(date));
};

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
