import { useMemo } from 'react';

import { groupChainsByGoal, useGetMyChainsQuery } from '@entities/chain';
import type { TRouteContext } from '@entities/chain';
import { useGetProductsQuery, useProductsById } from '@entities/product';
import { useGetCategoriesQuery } from '@entities/category';
import { useGetCurrentUserQuery } from '@entities/user';

/** Активный маршрут пользователя в виде, готовом для выбора в форме предложения. */
export type TMyGoal = {
    /** Идентификатор цели: товар или категория. */
    goalId: string;
    /** Название цели для интерфейса. */
    goalTitle: string;
    /** Название товара, который сейчас на руках, — если он известен. */
    currentProductTitle?: string;
    /** Сколько предложений по цели сейчас в работе. */
    openOffersCount: number;
    /** Контекст, который уйдёт в запрос при отправке предложения. */
    routeContext: TRouteContext;
};

type TUseMyGoalsParams = {
    /** Запрос не нужен, пока форма закрыта. */
    skip?: boolean;
};

/**
 * Собирает активные маршруты пользователя для привязки нового предложения.
 *
 * Показываются только цели, по которым есть незавершённые предложения либо
 * уже пройденные шаги: цель без единого движения нечего продолжать, а
 * полностью закрытая цель увела бы предложение в завершённый маршрут.
 */
export const useMyGoals = ({ skip = false }: TUseMyGoalsParams = {}) => {
    const { data: currentUser } = useGetCurrentUserQuery(undefined, { skip });
    const currentUserId = currentUser?.customer_id ?? '';

    const {
        data: chains = [],
        isLoading,
        isFetching,
    } = useGetMyChainsQuery(undefined, { skip: skip || !currentUserId });
    const { data: products = [] } = useGetProductsQuery(undefined, { skip });
    const { data: categories = [] } = useGetCategoriesQuery(undefined, { skip });

    const productIds = useMemo(
        () =>
            chains.flatMap((chain) => [
                chain.exchange_goal_id,
                chain.to_product_id,
                chain.route_step_id,
                chain.from_product_id,
            ]),
        [chains],
    );
    const productsById = useProductsById(productIds, products);

    const goals = useMemo<TMyGoal[]>(() => {
        if (!currentUserId) {
            return [];
        }

        return groupChainsByGoal(chains, currentUserId)
            .filter((group) => group.openOffersCount > 0 || group.completedOffersCount > 0)
            .map((group) => {
                const goalProduct = productsById.get(group.goalId);
                const goalCategoryName = group.goalCategoryId
                    ? categories.find(({ category_id }) => category_id === group.goalCategoryId)
                          ?.name
                    : undefined;

                return {
                    goalId: group.goalId,
                    goalTitle:
                        goalProduct?.title ??
                        (goalCategoryName ? `Любая вещь: ${goalCategoryName}` : 'Маршрут обмена'),
                    currentProductTitle: productsById.get(group.sourceProductId)?.title,
                    openOffersCount: group.openOffersCount,
                    routeContext: {
                        ...(group.goalCategoryId
                            ? { goalCategoryId: group.goalCategoryId }
                            : { exchangeGoalId: group.goalId }),
                        routeStepId: group.sourceProductId,
                        previousChainId: group.previousChainId,
                        goalTitle: goalProduct?.title ?? goalCategoryName,
                    },
                };
            });
    }, [categories, chains, currentUserId, productsById]);

    return {
        goals,
        isLoading: isLoading || isFetching,
    };
};
