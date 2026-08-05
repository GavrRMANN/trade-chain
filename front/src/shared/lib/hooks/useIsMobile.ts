import { useEffect, useState } from 'react';

const MOBILE_MEDIA_QUERY = '(max-width: 768px)';

export const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_MEDIA_QUERY).matches);

    useEffect(() => {
        const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
        const handleChange = () => setIsMobile(mediaQuery.matches);

        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return isMobile;
};
