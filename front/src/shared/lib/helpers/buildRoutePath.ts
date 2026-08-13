type TBuildRoutePathParams = {
    /** Идентификатор цели: товар или категория. */
    goalId: string;
    /** Товар, который сейчас на руках, — с него продолжится путь. */
    sourceProductId?: string;
    /** Заполнено, когда цель задана категорией, а не конкретным товаром. */
    goalCategoryId?: string;
};

/**
 * Собирает адрес страницы «Путь к цели».
 *
 * Ссылка на маршрут появляется в нескольких местах (список обменов, комната
 * сделки), а страница различает цель-товар и цель-категорию по разным
 * параметрам. Общий сборщик не даёт этим ссылкам разойтись: маршрут,
 * открытый из сделки, обязан совпасть с тем, что открывается из списка.
 */
export const buildRoutePath = ({
    goalId,
    sourceProductId,
    goalCategoryId,
}: TBuildRoutePathParams): string => {
    const params = new URLSearchParams();
    params.set(goalCategoryId ? 'targetCategory' : 'target', goalId);

    if (sourceProductId) {
        params.set('from', sourceProductId);
    }

    return `/route?${params.toString()}`;
};
