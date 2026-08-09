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

const withSuspense = (element: ReactElement, fallback: ReactElement = <Preloader />) => (
    <Suspense fallback={fallback}>{element}</Suspense>
);

const AuthModalLazy = lazy(() =>
    import('@pages/auth').then((module) => ({ default: module.AuthModal })),
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
const NotificationsPageLazy = lazy(() =>
    import('@pages/notifications').then((module) => ({ default: module.NotificationsPage })),
);

export const AppRouter = () => {
    const location = useLocation();
    const backgroundLocation = location.state?.backgroundLocation;

    return (
        <>
            <Routes location={backgroundLocation || location}>
                <Route element={<App />}>
                    <Route index element={<CatalogPage />} />
                    <Route path="create" element={<CreateProductPage />} />
                    <Route path="product/:productId" element={<ProductPage />} />
                    <Route path="product/:productId/edit" element={<CreateProductPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="profile/:customerId" element={<ProfilePage />} />
                    <Route path="exchanges" element={<ExchangesPage />} />
                    <Route path="exchanges/:chainId" element={withSuspense(<ExchangeRoomPageLazy />)} />
                    <Route path="route" element={withSuspense(<RoutePageLazy />)} />
                    <Route path="notifications" element={withSuspense(<NotificationsPageLazy />)} />
                    <Route path="*" element={withSuspense(<NotFoundPageLazy />)} />
                </Route>
            </Routes>

            {backgroundLocation && (
                <Routes>
                    <Route
                        path="/auth"
                        element={withSuspense(<AuthModalLazy />, <ModalPreload />)}
                    />
                </Routes>
            )}
        </>
    );
};
