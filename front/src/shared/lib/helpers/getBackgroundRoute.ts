import type { Location, Path } from 'react-router-dom';

export type BackgroundRouteState = {
    backgroundLocation: Path;
};

/**
 * Функция получения обратного пути
 */
export const getBackgroundRoute = (location: Location<BackgroundRouteState>) => {
    const backgroundLocation = location.state?.backgroundLocation;

    return backgroundLocation
        ? {
              pathname: backgroundLocation.pathname,
              search: backgroundLocation.search,
              hash: backgroundLocation.hash,
          }
        : '/';
};