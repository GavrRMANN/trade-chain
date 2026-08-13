import {useCallback, useEffect, useMemo, useReducer} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';

import {FINAL_CHAIN_STATUSES, groupChainsByGoal, useGetMyChainsQuery} from '@entities/chain';
import type {TChain} from '@entities/chain';
import {useGetProductsQuery, useProductsById} from '@entities/product';
import type {TProduct} from '@entities/product';
import {useGetCurrentUserQuery} from '@entities/user';

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
    isBuilderOpen: boolean;
    isProductFilterOpen: boolean;
};
type TExchangeUiAction = {type: 'update'; payload: Partial<TExchangeUiState>};
const exchangeUiReducer = (state: TExchangeUiState, action: TExchangeUiAction): TExchangeUiState => ({
    ...state,
    ...action.payload,
});

const isExchangeTab = (value: string | null): value is TExchangeTab =>
    value === 'active' || value === 'incoming' || value === 'outgoing' || value === 'completed';

const isRouteTab = (value: string | null): value is TExchangeRouteTab =>
    value === 'active' || value === 'completed';

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
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // UI-состояние
    const [uiState, dispatchUi] = useReducer(exchangeUiReducer, {
        isBuilderOpen: false,
        isProductFilterOpen: false,
    });
    const {isBuilderOpen, isProductFilterOpen} = uiState;
    const activeView: TExchangeView = searchParams.get('view') === 'exchanges' ? 'exchanges' : 'routes';
    const tab = searchParams.get('tab');
    const activeTab: TExchangeTab = isExchangeTab(tab)
        ? tab
        : 'active';
    const activeRouteTab: TExchangeRouteTab = isRouteTab(tab)
        ? tab
        : 'active';
    const selectedTab = activeView === 'exchanges' ? activeTab : activeRouteTab;
    const productFilter = searchParams.get('product');
    const setActiveTab = (value: TExchangeTab) => setSearchParams((currentParams) => {
        currentParams.set('view', 'exchanges');
        currentParams.set('tab', value);
        currentParams.delete('product');
        return currentParams;
    });
    const setActiveRouteTab = (value: TExchangeRouteTab) => setSearchParams((currentParams) => {
        currentParams.set('view', 'routes');
        currentParams.set('tab', value);
        currentParams.delete('product');
        return currentParams;
    });
    const setActiveView = (value: TExchangeView) => setSearchParams((currentParams) => {
        const currentTab = currentParams.get('tab');
        currentParams.set('view', value);
        currentParams.delete('product');
        currentParams.set(
            'tab',
            value === 'exchanges'
                ? (isExchangeTab(currentTab) ? currentTab : 'active')
                : (isRouteTab(currentTab) ? currentTab : 'active'),
        );
        return currentParams;
    });
    const setIsBuilderOpen = (value: boolean) => dispatchUi({type: 'update', payload: {isBuilderOpen: value}});
    const setIsProductFilterOpen = (value: boolean) =>
        dispatchUi({type: 'update', payload: {isProductFilterOpen: value}});
    const setProductFilter = (productId: string | null) => setSearchParams((currentParams) => {
        if (productId) {
            currentParams.set('product', productId);
        } else {
            currentParams.delete('product');
        }
        return currentParams;
    }, {replace: true});

    useEffect(() => {
        if (searchParams.get('view') === activeView && searchParams.get('tab') === selectedTab) {
            return;
        }
        setSearchParams((currentParams) => {
            currentParams.set('view', activeView);
            currentParams.set('tab', selectedTab);
            return currentParams;
        }, {replace: true});
    }, [activeView, searchParams, selectedTab, setSearchParams]);

    const {data: currentUser} = useGetCurrentUserQuery();
    const currentUserId = currentUser?.customer_id ?? '';

    const {
        data: chains = [],
        isLoading: isChainsLoading,
        isFetching: isChainsFetching,
        isError: isChainsError,
    } = useGetMyChainsQuery();

    const {data: products = []} = useGetProductsQuery();

    const productIds = useMemo(
        () => chains.flatMap((chain) => [
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

    const {active, incoming, outgoing, completed} = useMemo(() => {
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

        return {active, incoming: inc, outgoing: out, completed: done};
    }, [chains, currentUserId, buildRow]);

    const visibleRouteGroups = useMemo(() => {
        return routeGroups.filter((group) =>
            activeRouteTab === 'active' ? group.openOffersCount > 0 : group.openOffersCount === 0,
        );
    }, [activeRouteTab, routeGroups]);

    /* Бэкенд отдаёт /chains/my уже развёрнутым под зрителя (см.
       orientChainForCustomer на бэкенде): from_product_id — всегда мой
       товар, to_product_id — товар второй стороны, независимо от того,
       кто инициировал цепочку. Поэтому и во входящих, и в исходящих для
       фильтра берём именно fromProduct. */
    const filterableProducts = useMemo(() => {
        const rows = activeTab === 'incoming' ? incoming : activeTab === 'outgoing' ? outgoing : [];
        const byId = new Map<string, TProduct>();
        for (const row of rows) {
            if (row.fromProduct) byId.set(row.fromProduct.product_id, row.fromProduct);
        }
        return [...byId.values()];
    }, [activeTab, incoming, outgoing]);

    const selectedFilterProduct = useMemo(
        () => filterableProducts.find((product) => product.product_id === productFilter),
        [filterableProducts, productFilter],
    );

    const visibleRows = useMemo(() => {
        const rows =
            activeTab === 'active'
                ? active
                : activeTab === 'incoming'
                  ? incoming
                  : activeTab === 'outgoing'
                    ? outgoing
                    : completed;

        if (!productFilter || (activeTab !== 'incoming' && activeTab !== 'outgoing')) {
            return rows;
        }

        return rows.filter((row) => row.fromProduct?.product_id === productFilter);
    }, [activeTab, active, incoming, outgoing, completed, productFilter]);

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
        isProductFilterOpen,
        setIsProductFilterOpen,
        productFilter,
        setProductFilter,
        filterableProducts,
        selectedFilterProduct,
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
