import { lazy, Suspense, type ReactElement } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import { App } from '@app/App';
import { AuthModal, AuthPage } from '@pages/auth';
import { CatalogPage } from '@pages/catalog';
import { ProductPage } from '@pages/product';
import { ProfilePage } from '@pages/profile';
import { Preloader } from '@shared/ui/preloader';

const withSuspense = (element: ReactElement) => (
    <Suspense fallback={<Preloader />}>{element}</Suspense>
);

const NotFoundPageLazy = lazy(() =>
    import('@pages/notFound').then((module) => ({ default: module.NotFoundPage })),
);

export const AppRouter = () => {
    const location = useLocation();
    const backgroundLocation = location.state?.backgroundLocation;

    return (
        <>
            <Routes location={backgroundLocation || location}>
                <Route element={<App />}>
                    <Route index element={<CatalogPage />} />
                    <Route path="product/:productId" element={<ProductPage />} />
                    <Route path="auth" element={<AuthPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="profile/:customerId" element={<ProfilePage />} />
                    <Route path="*" element={withSuspense(<NotFoundPageLazy />)} />
                </Route>
            </Routes>

            {backgroundLocation && (
                <Routes>
                    <Route path="/auth" element={<AuthModal />} />
                </Routes>
            )}
        </>
    );
};
