import { useLocation } from 'react-router-dom';

export const useNotFoundPage = () => {
    const location = useLocation();

    return {
        backUrl: location.state?.backUrl as string | undefined,
    };
};
