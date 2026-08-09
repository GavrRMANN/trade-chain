import { useLocation } from 'react-router-dom';

import { useProtectedNavigation } from '@shared/lib';

/**
 * Инкапсулирует всю логику навигации и роутинга для MobileNavBar.
 */
export const useMobileNavBarActions = () => {
    const { pathname } = useLocation();
    const navigateProtected = useProtectedNavigation();

    return {
        isExchangesPage: pathname.startsWith('/exchanges'),
        isProfilePage: pathname.startsWith('/profile'),
        onExchanges: () => navigateProtected('/exchanges'),
        onCreate: () => navigateProtected('/create'),
        onProfile: () => navigateProtected('/profile'),
    };
};
