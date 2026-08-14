import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGetCategoriesQuery } from '@entities/category';
import {
    getChainGoalId,
    groupChainsByGoal,
    isRouteChain,
    useGetMyChainsQuery,
} from '@entities/chain';
import type { TChain } from '@entities/chain';
import { useGetProductsQuery, useProductsById } from '@entities/product';
import type { TProduct } from '@entities/product';
import { buildRoutePath, pluralize } from '@shared/lib';
import type { TPluralForms } from '@shared/lib';

type TUseChainRouteParams = {
    chain?: TChain;
    currentUserId?: string;
};

export type TChainRoute = {
    /** Название цели маршрута: товар или категория. */
    goalTitle: string;
    /** Товар-цель, если цель задана товаром: нужен для превью. */
    goalProduct?: TProduct;
    /** Маршрут ведёт текущий пользователь — только ему есть куда переходить. */
    isOwnRoute: boolean;
    /** Короткое пояснение под названием цели. */
    progressLabel: string;
    /** Переход на страницу «Путь к цели». Отсутствует у чужого маршрута. */
    openRoute?: () => void;
};

const EXCHANGE_FORMS: TPluralForms = ['обмен', 'обмена', 'обменов'];
const OFFER_FORMS: TPluralForms = ['предложение', 'предложения', 'предложений'];

/**
 * Определяет, к какой цепочке относится открытый обмен и как на неё перейти.
 *
 * Сама сделка о маршруте почти ничего не знает: в ней есть только цель и
 * текущий этап, а пройденные шаги лежат в остальных цепочках пользователя.
 * Поэтому цель и прогресс считаются по тому же разбору, что и список
 * маршрутов на странице обменов, — иначе комната называла бы цепочкой не то
 * же, что список, и счётчики в них разошлись бы.
 *
 * Свой обмен цепочку имеет всегда: даже у прямого предложения без явной цели
 * ею работает товар назначения — так его показывают и карточка обмена, и
 * вкладка «Цепочки обменов». Чужой обмен обозначается только внутри
 * настоящего маршрута: в прямом предложении «цель партнёра» — это вещь
 * самого пользователя, и сообщать тут нечего.
 *
 * Чужой маршрут при этом не открывается: страница «Путь к цели» строит путь
 * текущего пользователя, и вести туда с чужой цели значило бы показать не
 * тот маршрут.
 */
export const useChainRoute = ({
    chain,
    currentUserId,
}: TUseChainRouteParams): TChainRoute | undefined => {
    const navigate = useNavigate();

    const isOwnRoute = Boolean(chain && currentUserId && chain.initiator_id === currentUserId);
    const isVisible = Boolean(chain && (isOwnRoute || isRouteChain(chain)));
    const goalId = chain && isVisible ? getChainGoalId(chain) : undefined;

    const { data: chains = [] } = useGetMyChainsQuery(undefined, {
        skip: !isVisible || !isOwnRoute,
    });
    const { data: products = [] } = useGetProductsQuery(undefined, { skip: !isVisible });
    const { data: categories = [] } = useGetCategoriesQuery(undefined, {
        skip: !chain?.to_category_id,
    });

    const productsById = useProductsById([goalId], products);

    const group = useMemo(
        () =>
            goalId && isOwnRoute && currentUserId
                ? groupChainsByGoal(chains, currentUserId).find((item) => item.goalId === goalId)
                : undefined,
        [chains, currentUserId, goalId, isOwnRoute],
    );

    /* Шаг считается по завершённым обменам, случившимся раньше этого: так
       номер остаётся верным и для открытого предложения (следующий шаг), и
       для уже завершённого (тот, которым оно было). */
    const stepNumber = useMemo(() => {
        if (!chain || !goalId || !isOwnRoute) {
            return 1;
        }

        const completedBefore = chains.filter(
            (item) =>
                item.initiator_id === currentUserId &&
                item.status === 'completed' &&
                item.updated_at < chain.updated_at &&
                getChainGoalId(item) === goalId,
        ).length;

        return completedBefore + 1;
    }, [chain, chains, currentUserId, goalId, isOwnRoute]);

    const openRoute = useCallback(() => {
        if (!goalId || !chain) {
            return;
        }

        navigate(
            buildRoutePath({
                goalId,
                // Маршрут мог уйти вперёд, поэтому продолжается он с текущего
                // этапа группы, а не с товара этой конкретной сделки.
                sourceProductId:
                    group?.sourceProductId ?? chain.route_step_id ?? chain.from_product_id,
                goalCategoryId: group?.goalCategoryId ?? chain.to_category_id,
            }),
        );
    }, [chain, goalId, group, navigate]);

    if (!chain || !isVisible || !goalId) {
        return undefined;
    }

    const goalProduct = productsById.get(goalId);
    const goalCategoryName = chain.to_category_id
        ? categories.find(({ category_id }) => category_id === chain.to_category_id)?.name
        : undefined;

    const progressLabel = isOwnRoute
        ? [
              `Шаг ${stepNumber}`,
              group && group.completedOffersCount > 0
                  ? `пройдено ${pluralize(group.completedOffersCount, EXCHANGE_FORMS)}`
                  : undefined,
              group && group.openOffersCount > 0
                  ? `${pluralize(group.openOffersCount, OFFER_FORMS)} в работе`
                  : undefined,
          ]
              .filter(Boolean)
              .join(' · ')
        : 'Партнёр идёт к своей цели — этот обмен один из шагов пути';

    return {
        goalTitle:
            goalProduct?.title ??
            (goalCategoryName ? `Любая вещь: ${goalCategoryName}` : 'Цель маршрута'),
        goalProduct,
        isOwnRoute,
        progressLabel,
        openRoute: isOwnRoute ? openRoute : undefined,
    };
};
