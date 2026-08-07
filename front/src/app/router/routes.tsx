import {createBrowserRouter} from 'react-router-dom';
import {App} from '@app/App';
import {lazy, ReactElement, Suspense} from 'react';
import {Preloader} from '@shared/ui/preloader';
import {CatalogPage} from "@pages/catalog";

const withSuspense = (element: ReactElement) => (
    <Suspense fallback={<Preloader/>}>{element}</Suspense>
);

const NotFoundPageLazy = lazy(() =>
    import('@pages/notFound').then((module) => ({default: module.NotFoundPage})),
);

export const browserRouting = createBrowserRouter([
    {
        path: '/*',
        element: <App/>,
        children: [
            {
                index: true,
                element: withSuspense(<CatalogPage/>),
            },
            {
                path: '*',
                element: withSuspense(<NotFoundPageLazy/>),
            },
        ],
    },
]);
