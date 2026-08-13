import { lazy, Suspense, type ReactElement } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import { App } from '@app/App';
import { CatalogPage } from '@pages/catalog';
import { CreateProductPage } from '@pages/createProduct';
import { ExchangesPage } from '@pages/exchanges';
import { ProductPage } from '@pages/product';
import { ProfilePage } from '@pages/profile';
import { Preloader } from '@shared/ui/preloader';
import { ModalPreload } from '@shared/ui/modalPreload';
import { MODAL_ROUTE_PATHS } from '@shared/lib';
import { ProtectedRoute } from './ProtectedRoute';

const withSuspense = (element: ReactElement, fallback: ReactElement = <Preloader />) => (
    <Suspense fallback={fallback}>{element}</Suspense>
);

const AuthModalLazy = lazy(() =>
    import('@pages/auth').then((module) => ({ default: module.AuthModal })),
);

const OfferExchangeRouteLazy = lazy(() =>
    import('@features/exchange').then((module) => ({ default: module.OfferExchangeRoute })),
);
const ArchiveProductRouteLazy = lazy(() =>
    import('@pages/product').then((module) => ({ default: module.ArchiveProductRoute })),
);
const RouteBuilderRouteLazy = lazy(() =>
    import('@pages/exchanges').then((module) => ({ default: module.RouteBuilderRoute })),
);
const ProductFilterRouteLazy = lazy(() =>
    import('@pages/exchanges').then((module) => ({ default: module.ProductFilterRoute })),
);

const DemoAccountsPageLazy = lazy(() =>
    import('@pages/demoAccounts').then((module) => ({ default: module.DemoAccountsPage })),
);

const NotFoundPageLazy = lazy(() =>
    import('@pages/notFound').then((module) => ({ default: module.NotFoundPage })),
);
const ExchangeRoomPageLazy = lazy(() =>
    import('@pages/exchangeRoom').then((module) => ({ default: module.ExchangeRoomPage })),
);
const RoutePageLazy = lazy(() =>
    import('@pages/route').then((module) => ({ default: module.RoutePage })),
);
const RouteFeedPageLazy = lazy(() =>
    import('@pages/route').then((module) => ({ default: module.RouteFeedPage })),
);
const NotificationsPageLazy = lazy(() =>
    import('@pages/notifications').then((module) => ({ default: module.NotificationsPage })),
);

/**
 * Модальные окна проекта, открываемые через адресную строку.
 *
 * Один список на два дерева маршрутов: поверх фоновой страницы (обычное
 * открытие модалки) и в основном дереве (прямая ссылка или перезагрузка,
 * когда фона в истории нет). Общий источник не даёт разойтись этим случаям —
 * ссылка на модалку обязана работать в обоих.
 */
const MODAL_ROUTES: { path: string; element: ReactElement }[] = [
    {
        path: MODAL_ROUTE_PATHS.auth,
        element: withSuspense(<AuthModalLazy />, <ModalPreload />),
    },
    {
        path: MODAL_ROUTE_PATHS.offerExchange,
        element: withSuspense(<OfferExchangeRouteLazy />, <ModalPreload />),
    },
    {
        path: MODAL_ROUTE_PATHS.archiveProduct,
        element: withSuspense(<ArchiveProductRouteLazy />, <ModalPreload />),
    },
    {
        path: MODAL_ROUTE_PATHS.routeBuilder,
        element: withSuspense(<RouteBuilderRouteLazy />, <ModalPreload />),
    },
    {
        path: MODAL_ROUTE_PATHS.exchangeFilter,
        element: withSuspense(<ProductFilterRouteLazy />, <ModalPreload />),
    },
];

/** Модалки, доступные только авторизованным: гостя перехватит ProtectedRoute. */
const PROTECTED_MODAL_PATHS = new Set<string>([
    MODAL_ROUTE_PATHS.offerExchange,
    MODAL_ROUTE_PATHS.archiveProduct,
    MODAL_ROUTE_PATHS.routeBuilder,
    MODAL_ROUTE_PATHS.exchangeFilter,
]);

const publicModalRoutes = MODAL_ROUTES.filter(({ path }) => !PROTECTED_MODAL_PATHS.has(path));
const protectedModalRoutes = MODAL_ROUTES.filter(({ path }) => PROTECTED_MODAL_PATHS.has(path));

export const AppRouter = () => {
    const location = useLocation();
    const backgroundLocation = location.state?.backgroundLocation;

    return (
        <>
            <Routes location={backgroundLocation || location}>
                <Route element={<App />}>
                    <Route index element={<CatalogPage />} />
                    <Route path="product/:productId" element={<ProductPage />} />
                    <Route path="demo" element={withSuspense(<DemoAccountsPageLazy />)} />
                    {publicModalRoutes.map(({ path, element }) => (
                        <Route key={path} path={path} element={element} />
                    ))}
                    <Route element={<ProtectedRoute />}>
                        <Route path="create" element={<CreateProductPage />} />
                        <Route path="product/:productId/edit" element={<CreateProductPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="profile/:customerId" element={<ProfilePage />} />
                        <Route path="exchanges" element={<ExchangesPage />} />
                        <Route path="exchanges/:chainId" element={withSuspense(<ExchangeRoomPageLazy />)} />
                        <Route path="route" element={withSuspense(<RoutePageLazy />)} />
                        {/* Подборка следующего шага — часть того же маршрута:
                            параметры цели и стартового товара остаются в query,
                            а доступ к чужой подборке закрывает сама страница —
                            она рендерится, только если этап подтверждён вещами
                            текущего пользователя. */}
                        <Route path="route/feed" element={withSuspense(<RouteFeedPageLazy />)} />
                        <Route path="notifications" element={withSuspense(<NotificationsPageLazy />)} />
                        {protectedModalRoutes.map(({ path, element }) => (
                            <Route key={path} path={path} element={element} />
                        ))}
                    </Route>
                    <Route path="*" element={withSuspense(<NotFoundPageLazy />)} />
                </Route>
            </Routes>

            {backgroundLocation && (
                <Routes>
                    {MODAL_ROUTES.map(({ path, element }) => (
                        <Route key={path} path={path} element={element} />
                    ))}
                </Routes>
            )}
        </>
    );
};
