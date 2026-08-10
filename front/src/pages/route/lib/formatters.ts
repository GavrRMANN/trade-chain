export const formatExchangeCount = (count: number): string => {
    const lastTwo = count % 100;
    const last = count % 10;
    const word =
        lastTwo >= 11 && lastTwo <= 14
            ? 'обменов'
            : last === 1
              ? 'обмен'
              : last >= 2 && last <= 4
                ? 'обмена'
                : 'обменов';
    return `${count} ${word}`;
};

export const formatCompletedCount = (count: number): string => {
    const lastTwo = count % 100;
    const last = count % 10;
    const words =
        lastTwo >= 11 && lastTwo <= 14
            ? 'завершённых обменов'
            : last === 1
              ? 'завершённый обмен'
              : last >= 2 && last <= 4
                ? 'завершённых обмена'
                : 'завершённых обменов';
    return `${count} ${words}`;
};
