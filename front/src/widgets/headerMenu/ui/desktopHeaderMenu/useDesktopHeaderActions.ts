import { useLocation } from 'react-router-dom';

import { useProtectedNavigation } from '@shared/lib';

/**
 * Инкапсулирует всю логику навигации и роутинга для DesktopHeaderMenu.
 */
export const useDesktopHeaderActions = () => {
    const { pathname } = useLocation();
    const navigateProtected = useProtectedNavigation();

    return {
        isExchangesPage: pathname.startsWith('/exchanges'),
        isCreatePage: pathname === '/create',
        isProfilePage: pathname.startsWith('/profile'),
        onCreate: () => navigateProtected('/create'),
        onExchanges: () => navigateProtected('/exchanges'),
        onProfile: () => navigateProtected('/profile'),
    };
};
