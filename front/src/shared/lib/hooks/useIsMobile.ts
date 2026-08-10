import { useEffect, useReducer } from 'react';

const MOBILE_MEDIA_QUERY = '(max-width: 768px)';

export const useIsMobile = () => {
    const [state, dispatch] = useReducer(
        (_: { isMobile: boolean }, isMobile: boolean) => ({ isMobile }),
        undefined,
        () => ({ isMobile: window.matchMedia(MOBILE_MEDIA_QUERY).matches }),
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
        const handleChange = () => dispatch(mediaQuery.matches);

        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return state.isMobile;
};
