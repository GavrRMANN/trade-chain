import type { TCreateChainRequest } from '../types';

/**
 * Контекст персонального маршрута, в рамках которого отправляется предложение.
 *
 * Пока предложение уходит без этих полей, бэкенд создаёт самостоятельную
 * цепочку: цель и пройденные шаги к ней не привязываются, и обещание
 * «маршрут продолжится» выполняется только на словах. Поэтому контекст
 * собирается в одном месте и используется всеми точками входа — карточкой
 * товара, лентой и страницей «Путь к цели».
 */
export type TRouteContext = {
    /** Конечная цель маршрута — товар. */
    exchangeGoalId?: string;
    /** Конечная цель маршрута — категория (когда цель задана категорией). */
    goalCategoryId?: string;
    /** Товар, который сейчас на руках у пользователя, — текущий этап маршрута. */
    routeStepId?: string;
    /** Последний завершённый шаг: связывает новую цепочку с историей пути. */
    previousChainId?: string;
    /** Название цели — только для интерфейса, в запрос не уходит. */
    goalTitle?: string;
};

type TBuildChainPayloadParams = {
    /** Товар, который пользователь отдаёт. */
    fromProductId: string;
    /** Товар, который пользователь хочет получить. */
    toProductId: string;
    /** Комментарий владельцу. */
    message?: string;
    /** Контекст маршрута, если предложение делается внутри пути к цели. */
    routeContext?: TRouteContext;
};

/**
 * Собирает тело запроса на создание цепочки.
 *
 * Без контекста маршрута получается обычное прямое предложение — ровно то,
 * что форма отправляла и раньше. С контекстом добавляются связи с целью,
 * текущим этапом и предыдущим шагом.
 */
export const buildChainPayload = ({
    fromProductId,
    toProductId,
    message,
    routeContext,
}: TBuildChainPayloadParams): TCreateChainRequest => {
    const trimmedMessage = message?.trim();

    return {
        from_product_id: fromProductId,
        to_product_id: toProductId,
        status: 'pending',
        ...(trimmedMessage ? { message: trimmedMessage } : {}),
        // Цель-категория и цель-товар взаимоисключающи: бэкенд хранит их в
        // разных полях, и заполнять оба одновременно нельзя.
        ...(routeContext?.goalCategoryId
            ? { to_category_id: routeContext.goalCategoryId }
            : routeContext?.exchangeGoalId
              ? { exchange_goal_id: routeContext.exchangeGoalId }
              : {}),
        ...(routeContext?.routeStepId ? { route_step_id: routeContext.routeStepId } : {}),
        ...(routeContext?.previousChainId
            ? { previous_chain_id: routeContext.previousChainId }
            : {}),
    };
};
