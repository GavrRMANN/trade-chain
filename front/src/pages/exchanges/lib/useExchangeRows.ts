import { useMemo } from 'react';

import { FINAL_CHAIN_STATUSES, groupChainsByGoal, useGetMyChainsQuery } from '@entities/chain';
import type { TChain } from '@entities/chain';
import { useGetProductsQuery, useProductsById } from '@entities/product';
import type { TProduct } from '@entities/product';
import { useGetCurrentUserQuery } from '@entities/user';

export type TExchangeRow = {
    chain: TChain;
    fromProduct?: TProduct;
    toProduct?: TProduct;
    goalProduct?: TProduct;
};

export type TExchangeRouteGroup = {
    goalId: string;
    goalCategoryId?: string;
    goalProduct?: TProduct;
    sourceProduct?: TProduct;
    sourceProductId: string;
    offersCount: number;
    openOffersCount: number;
    completedOffersCount: number;
    updatedAt: string;
};

/**
 * Раскладывает цепочки текущего пользователя по разделам страницы обменов.
 *
 * Хук отделён от {@link useExchanges}, потому что тем же разбором пользуется
 * модальный маршрут фильтра по товару: без общего источника список товаров в
 * фильтре мог бы разойтись со списком, который фильтруется.
 *
 * Деление по вкладкам сознательно упрощено во избежание неоднозначности
 * (терминальный обмен мог быть и входящим, и исходящим):
 *   — «Завершённые»: все цепочки с терминальным статусом (независимо от инициатора).
 *   — «Входящие»: незавершённые И инициатор — не текущий пользователь.
 *   — «Исходящие»: незавершённые И инициатор — текущий пользователь.
 */
export const useExchangeRows = () => {
    const { data: currentUser } = useGetCurrentUserQuery();
    const currentUserId = currentUser?.customer_id ?? '';

    const { data: chains = [], isLoading, isFetching, isError } = useGetMyChainsQuery();

    const { data: products = [] } = useGetProductsQuery();

    const productIds = useMemo(
        () =>
            chains.flatMap((chain) => [
                chain.from_product_id,
                chain.to_product_id,
                chain.exchange_goal_id,
                chain.route_step_id,
            ]),
        [chains],
    );
    const productsById = useProductsById(productIds, products);

    const buildRow = useMemo(() => {
        return (chain: TChain): TExchangeRow => ({
            chain,
            fromProduct: productsById.get(chain.from_product_id),
            toProduct: chain.to_product_id ? productsById.get(chain.to_product_id) : undefined,
            goalProduct: chain.exchange_goal_id
                ? productsById.get(chain.exchange_goal_id)
                : chain.to_product_id
                  ? productsById.get(chain.to_product_id)
                  : undefined,
        });
    }, [productsById]);

    /* Группировка по целям общая с формой предложения: там она решает,
       к какому маршруту привязать новую цепочку, — расхождение двух копий
       развело бы список маршрутов и фактическую привязку. */
    const routeGroups = useMemo<TExchangeRouteGroup[]>(
        () =>
            groupChainsByGoal(chains, currentUserId).map((group) => ({
                ...group,
                goalProduct: productsById.get(group.goalId),
                sourceProduct: productsById.get(group.sourceProductId),
            })),
        [chains, currentUserId, productsById],
    );

    const { active, incoming, outgoing, completed } = useMemo(() => {
        const active: TExchangeRow[] = [];
        const inc: TExchangeRow[] = [];
        const out: TExchangeRow[] = [];
        const done: TExchangeRow[] = [];

        for (const chain of chains) {
            if (FINAL_CHAIN_STATUSES.has(chain.status)) {
                done.push(buildRow(chain));
                continue;
            }

            if (chain.status === 'active') {
                active.push(buildRow(chain));
            }

            if (chain.initiator_id === currentUserId) {
                out.push(buildRow(chain));
            } else {
                inc.push(buildRow(chain));
            }
        }

        return { active, incoming: inc, outgoing: out, completed: done };
    }, [chains, currentUserId, buildRow]);

    return {
        currentUserId,
        active,
        incoming,
        outgoing,
        completed,
        routeGroups,
        isLoading,
        isFetching,
        isError,
    };
};
