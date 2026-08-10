import {useCallback, useMemo, useReducer} from 'react';
import {useNavigate} from 'react-router-dom';

import {useGetMyChainsQuery} from '@entities/chain';
import type {TChain, TChainStatus} from '@entities/chain';
import {useGetProductsQuery} from '@entities/product';
import type {TProduct} from '@entities/product';
import {useGetCurrentUserQuery} from '@entities/user';
import {usePageTitle} from '@app/providers/pageTitle';
import {useLayoutEffect} from 'react';

/** Статусы, считающиеся терминальными — обмен завершён и больше не активен. */
const FINAL_STATUSES: ReadonlySet<TChainStatus> = new Set<TChainStatus>([
    'completed',
    'cancelled',
    'rejected',
    'failed',
    'expired',
    'unavailable',
]);

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

export type TExchangeTab = 'active' | 'incoming' | 'outgoing' | 'completed';

export type TExchangeRouteTab = 'active' | 'completed';

export type TExchangeView = 'routes' | 'exchanges';

type TExchangeUiState = {
    activeTab: TExchangeTab;
    activeRouteTab: TExchangeRouteTab;
    activeView: TExchangeView;
    isBuilderOpen: boolean;
};
type TExchangeUiAction = {type: 'update'; payload: Partial<TExchangeUiState>};
const exchangeUiReducer = (state: TExchangeUiState, action: TExchangeUiAction): TExchangeUiState => ({
    ...state,
    ...action.payload,
});

const formatActiveOffers = (count: number): string => {
    const lastTwo = count % 100;
    const last = count % 10;
    const word =
        lastTwo >= 11 && lastTwo <= 14
            ? 'активных предложений'
            : last === 1
              ? 'активное предложение'
              : last >= 2 && last <= 4
                ? 'активных предложения'
                : 'активных предложений';

    return `${count} ${word}`;
};

/**
 * Управляет данными, фильтрацией по вкладкам и навигацией страницы «Мои обмены».
 *
 * Деление по вкладкам сознательно упрощено во избежание неоднозначности
 * (терминальный обмен мог быть и входящим, и исходящим):
 *   — «Завершённые»: все цепочки с терминальным статусом (независимо от инициатора).
 *   — «Входящие»: незавершённые И инициатор — не текущий пользователь.
 *   — «Исходящие»: незавершённые И инициатор — текущий пользователь.
 */
export const useExchanges = () => {
    const {setTitle} = usePageTitle();
    const navigate = useNavigate();

    // UI-состояние
    const [uiState, dispatchUi] = useReducer(exchangeUiReducer, {
        activeTab: 'active',
        activeRouteTab: 'active',
        activeView: 'routes',
        isBuilderOpen: false,
    });
    const {activeTab, activeRouteTab, activeView, isBuilderOpen} = uiState;
    const setActiveTab = (value: TExchangeTab) => dispatchUi({type: 'update', payload: {activeTab: value}});
    const setActiveRouteTab = (value: TExchangeRouteTab) => dispatchUi({type: 'update', payload: {activeRouteTab: value}});
    const setActiveView = (value: TExchangeView) => dispatchUi({type: 'update', payload: {activeView: value}});
    const setIsBuilderOpen = (value: boolean) => dispatchUi({type: 'update', payload: {isBuilderOpen: value}});

    const {data: currentUser} = useGetCurrentUserQuery();
    const currentUserId = currentUser?.customer_id ?? '';

    const {
        data: chains = [],
        isLoading: isChainsLoading,
        isFetching: isChainsFetching,
        isError: isChainsError,
    } = useGetMyChainsQuery();

    const {data: products = []} = useGetProductsQuery();

    const productsById = useMemo(() => {
        const map = new Map<string, TProduct>();
        for (const product of products) {
            map.set(product.product_id, product);
        }
        return map;
    }, [products]);

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

    const routeGroups = useMemo<TExchangeRouteGroup[]>(() => {
        const groups = new Map<string, TExchangeRouteGroup>();

        for (const chain of chains) {
            if (chain.initiator_id !== currentUserId) {
                continue;
            }

            const goalId = chain.exchange_goal_id ?? chain.to_product_id ?? chain.to_category_id;
            if (!goalId) {
                continue;
            }
            const goalCategoryId = chain.to_category_id && !chain.to_product_id
                ? chain.to_category_id
                : undefined;
            const current = groups.get(goalId);
            const isOpen = !FINAL_STATUSES.has(chain.status);
            const isCompleted = chain.status === 'completed';

            if (!current) {
                groups.set(goalId, {
                    goalId,
                    goalCategoryId,
                    goalProduct: productsById.get(goalId),
                    sourceProductId: chain.route_step_id ?? chain.from_product_id,
                    sourceProduct: productsById.get(chain.route_step_id ?? chain.from_product_id),
                    offersCount: 1,
                    openOffersCount: isOpen ? 1 : 0,
                    completedOffersCount: isCompleted ? 1 : 0,
                    updatedAt: chain.updated_at,
                });
                continue;
            }

            current.offersCount += 1;
            current.openOffersCount += isOpen ? 1 : 0;
            current.completedOffersCount += isCompleted ? 1 : 0;

            if (chain.updated_at > current.updatedAt) {
                current.updatedAt = chain.updated_at;
                current.sourceProductId = chain.route_step_id ?? chain.from_product_id;
                current.sourceProduct = productsById.get(
                    chain.route_step_id ?? chain.from_product_id,
                );
            }
        }

        return [...groups.values()].sort((left, right) =>
            right.updatedAt.localeCompare(left.updatedAt),
        );
    }, [chains, currentUserId, productsById]);

    const {active, incoming, outgoing, completed} = useMemo(() => {
        const active: TExchangeRow[] = [];
        const inc: TExchangeRow[] = [];
        const out: TExchangeRow[] = [];
        const done: TExchangeRow[] = [];

        for (const chain of chains) {
            if (FINAL_STATUSES.has(chain.status)) {
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

        return {active, incoming: inc, outgoing: out, completed: done};
    }, [chains, currentUserId, buildRow]);

    const visibleRouteGroups = useMemo(() => {
        return routeGroups.filter((group) =>
            activeRouteTab === 'active' ? group.openOffersCount > 0 : group.openOffersCount === 0,
        );
    }, [activeRouteTab, routeGroups]);

    const visibleRows = useMemo(() => {
        if (activeTab === 'active') return active;
        if (activeTab === 'incoming') return incoming;
        if (activeTab === 'outgoing') return outgoing;
        return completed;
    }, [activeTab, active, incoming, outgoing, completed]);

    useLayoutEffect(() => {
        setTitle('Мои обмены');
    }, [setTitle]);

    const openExchange = useCallback((chainId: string) => {
        navigate(`/exchanges/${chainId}`);
    }, [navigate]);

    const openRoute = useCallback((goalId: string, sourceId?: string, goalCategoryId?: string) => {
        const params = new URLSearchParams();
        params.set(goalCategoryId ? 'targetCategory' : 'target', goalId);
        if (sourceId) {
            params.set('from', sourceId);
        }
        navigate(`/route?${params.toString()}`);
    }, [navigate]);

    return {
        currentUserId,
        // UI
        activeTab,
        setActiveTab,
        activeRouteTab,
        setActiveRouteTab,
        activeView,
        setActiveView,
        isBuilderOpen,
        setIsBuilderOpen,
        // данные
        active,
        incoming,
        outgoing,
        completed,
        visibleRows,
        routeGroups,
        visibleRouteGroups,
        isLoading: isChainsLoading,
        isFetching: isChainsFetching,
        isError: isChainsError,
        // навигация
        openExchange,
        openRoute,
        // хелперы
        formatActiveOffers,
    };
};
