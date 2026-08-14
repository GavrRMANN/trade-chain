import type { TProduct } from '@entities/product';

/**
 * Разворачивает найденный маршрут в порядок, в котором его проходит человек:
 * своя вещь первой, цель последней.
 *
 * Поиск обходит граф от цели к вещам пользователя и отдаёт путь целью вперёд.
 * Экран читает цепочку с другого конца: следующий обмен — это сосед текущей
 * вещи, а сколько осталось до цели — расстояние до конца пути. С чужим
 * порядком следующим шагом читается сама цель, а «до цели» всегда выходит
 * один обмен.
 *
 * Ориентируемся по концам пути, а не по факту переворота: порядок выдачи
 * поиска уже менялся, и страница не должна ломаться, если его поменяют снова.
 */
export const orderChainForRoute = (
    products: TProduct[],
    { sourceId, targetId }: { sourceId: string; targetId: string },
): TProduct[] => {
    const chain = [...products];

    if (chain.length < 2) {
        return chain;
    }

    const isGoalFirst =
        chain[0].product_id === targetId || chain[chain.length - 1].product_id === sourceId;

    return isGoalFirst ? chain.reverse() : chain;
};
