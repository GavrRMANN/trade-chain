import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { buildRoutePath, MODAL_ROUTE_PATHS, useIsMobile, useOpenModalRoute } from '@shared/lib';

import { getFilterableProducts } from './getFilterableProducts';
import { useExchangeRows } from './useExchangeRows';

export type TExchangeTab = 'active' | 'incoming' | 'outgoing' | 'completed';

export type TExchangeRouteTab = 'active' | 'completed';

export type TExchangeView = 'routes' | 'exchanges';

export const isExchangeTab = (value: string | null): value is TExchangeTab =>
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
 * Управляет фильтрацией по вкладкам и навигацией страницы «Мои обмены».
 *
 * Разбор цепочек вынесен в {@link useExchangeRows}, а обе модалки страницы
 * (создание цепочки и фильтр по товару) живут отдельными маршрутами.
 */
export const useExchanges = () => {
    const navigate = useNavigate();
    const openModalRoute = useOpenModalRoute();
    const isMobile = useIsMobile();
    const [searchParams, setSearchParams] = useSearchParams();

    const activeView: TExchangeView =
        searchParams.get('view') === 'exchanges' ? 'exchanges' : 'routes';
    const tab = searchParams.get('tab');
    const activeTab: TExchangeTab = isExchangeTab(tab) ? tab : 'active';
    const activeRouteTab: TExchangeRouteTab = isRouteTab(tab) ? tab : 'active';
    const selectedTab = activeView === 'exchanges' ? activeTab : activeRouteTab;
    const productFilter = searchParams.get('product');
    const setActiveTab = (value: TExchangeTab) =>
        setSearchParams((currentParams) => {
            currentParams.set('view', 'exchanges');
            currentParams.set('tab', value);
            currentParams.delete('product');
            return currentParams;
        });
    const setActiveRouteTab = (value: TExchangeRouteTab) =>
        setSearchParams((currentParams) => {
            currentParams.set('view', 'routes');
            currentParams.set('tab', value);
            currentParams.delete('product');
            return currentParams;
        });
    const setActiveView = (value: TExchangeView) =>
        setSearchParams((currentParams) => {
            const currentTab = currentParams.get('tab');
            currentParams.set('view', value);
            currentParams.delete('product');
            currentParams.set(
                'tab',
                value === 'exchanges'
                    ? isExchangeTab(currentTab)
                        ? currentTab
                        : 'active'
                    : isRouteTab(currentTab)
                      ? currentTab
                      : 'active',
            );
            return currentParams;
        });
    const resetProductFilter = () =>
        setSearchParams(
            (currentParams) => {
                currentParams.delete('product');
                return currentParams;
            },
            { replace: true },
        );

    /* Обе модалки страницы открываются как маршруты. Фильтр получает текущую
       query-строку: вкладка и выбранный товар нужны ему, чтобы показать те же
       товары, что фильтруются под ним. Создание цепочки на телефоне — не
       модалка поверх фона, а обычная страница, поэтому туда переходят без
       backgroundLocation. */
    const openRouteBuilder = () => {
        if (isMobile) {
            navigate(MODAL_ROUTE_PATHS.routeBuilder);
            return;
        }
        openModalRoute({ name: 'routeBuilder' });
    };
    const openProductFilter = () =>
        openModalRoute({ name: 'exchangeFilter', search: searchParams.toString() });

    useEffect(() => {
        if (searchParams.get('view') === activeView && searchParams.get('tab') === selectedTab) {
            return;
        }
        setSearchParams(
            (currentParams) => {
                currentParams.set('view', activeView);
                currentParams.set('tab', selectedTab);
                return currentParams;
            },
            { replace: true },
        );
    }, [activeView, searchParams, selectedTab, setSearchParams]);

    const {
        currentUserId,
        active,
        incoming,
        outgoing,
        completed,
        routeGroups,
        isLoading,
        isFetching,
        isError,
    } = useExchangeRows();

    const visibleRouteGroups = useMemo(() => {
        return routeGroups.filter((group) =>
            activeRouteTab === 'active' ? group.openOffersCount > 0 : group.openOffersCount === 0,
        );
    }, [activeRouteTab, routeGroups]);

    const filterableProducts = useMemo(
        () => getFilterableProducts(activeTab, { incoming, outgoing }),
        [activeTab, incoming, outgoing],
    );

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

    const openExchange = useCallback(
        (chainId: string) => {
            navigate(`/exchanges/${chainId}`);
        },
        [navigate],
    );

    const openRoute = useCallback(
        (goalId: string, sourceId?: string, goalCategoryId?: string) => {
            navigate(buildRoutePath({ goalId, sourceProductId: sourceId, goalCategoryId }));
        },
        [navigate],
    );

    return {
        currentUserId,
        // UI
        activeTab,
        setActiveTab,
        activeRouteTab,
        setActiveRouteTab,
        activeView,
        setActiveView,
        productFilter,
        resetProductFilter,
        filterableProducts,
        selectedFilterProduct,
        // модальные маршруты
        openRouteBuilder,
        openProductFilter,
        // данные
        active,
        incoming,
        outgoing,
        completed,
        visibleRows,
        routeGroups,
        visibleRouteGroups,
        isLoading,
        isFetching,
        isError,
        // навигация
        openExchange,
        openRoute,
        // хелперы
        formatActiveOffers,
    };
};
