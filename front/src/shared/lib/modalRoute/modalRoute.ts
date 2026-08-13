import type { Location, Path } from 'react-router-dom';

/**
 * Состояние, с которым открывается модальное окно-маршрут.
 *
 * {@code backgroundLocation} — страница, оставшаяся под модалкой: по ней
 * рендерится основное дерево маршрутов, пока в адресе стоит путь модалки,
 * и на неё же возвращается закрытие.
 */
export type BackgroundRouteState = {
    backgroundLocation: Path;
    /** Путь возврата после успешного входа через ProtectedRoute. */
    authReturn?: Path;
};

/**
 * Описание модального окна, открываемого через адресную строку.
 *
 * Все модалки проекта перечислены здесь: путь собирается только из этого
 * union, поэтому маршрут модалки нельзя случайно разойтись с реестром в
 * {@code app/router/routes.tsx}.
 */
export type TModalRoute =
    | { name: 'auth' }
    | {
          name: 'offerExchange';
          productId: string;
          /**
           * Контекст маршрута («Путь к цели»). Уходит в адрес, а не в state,
           * чтобы предложение переживало перезагрузку страницы и не теряло
           * привязку к цепочке.
           */
          exchangeGoalId?: string;
          goalCategoryId?: string;
          routeStepId?: string;
          previousChainId?: string;
          goalTitle?: string;
      }
    | { name: 'archiveProduct'; productId: string }
    | { name: 'routeBuilder' }
    | {
          name: 'exchangeFilter';
          /** Query-строка страницы обменов: вкладка и текущий фильтр. */
          search?: string;
      };

/** Шаблоны путей модальных окон — используются при регистрации маршрутов. */
export const MODAL_ROUTE_PATHS = {
    auth: '/auth',
    offerExchange: '/product/:productId/offer',
    archiveProduct: '/product/:productId/archive',
    routeBuilder: '/exchanges/new',
    exchangeFilter: '/exchanges/filter',
} as const;

const withSearch = (pathname: string, params: Record<string, string | undefined>): string => {
    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value) {
            search.set(key, value);
        }
    }

    const query = search.toString();

    return query ? `${pathname}?${query}` : pathname;
};

/**
 * Строит путь модального окна для открытия через react-router.
 * @param route Описание модального окна.
 * @returns Путь модального окна вместе с query-параметрами.
 */
export const buildModalRoutePath = (route: TModalRoute): string => {
    switch (route.name) {
        case 'auth':
            return MODAL_ROUTE_PATHS.auth;
        case 'offerExchange':
            return withSearch(`/product/${route.productId}/offer`, {
                goal: route.exchangeGoalId,
                goalCategory: route.goalCategoryId,
                step: route.routeStepId,
                prevChain: route.previousChainId,
                goalTitle: route.goalTitle,
            });
        case 'archiveProduct':
            return `/product/${route.productId}/archive`;
        case 'routeBuilder':
            return MODAL_ROUTE_PATHS.routeBuilder;
        case 'exchangeFilter':
            return route.search
                ? `${MODAL_ROUTE_PATHS.exchangeFilter}${route.search.startsWith('?') ? '' : '?'}${route.search}`
                : MODAL_ROUTE_PATHS.exchangeFilter;
    }
};

const getLocationPath = (path: Path) => ({
    pathname: path.pathname,
    search: path.search,
    hash: path.hash,
});

/**
 * Возвращает страницу, поверх которой открыли модалку.
 * @param location Текущая локация модального маршрута.
 * @param fallback Путь на случай прямого захода по ссылке, когда фона нет.
 */
export const getModalBackgroundRoute = (
    location: Location<BackgroundRouteState>,
    fallback = '/',
): Path | string => {
    const backgroundLocation = location.state?.backgroundLocation;

    return backgroundLocation ? getLocationPath(backgroundLocation) : fallback;
};
