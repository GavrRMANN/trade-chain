import {useReducer} from 'react';

export const useMobileRouteStep = () => {
    const [mobileStep, setMobileStep] = useReducer((_: 1 | 2, next: 1 | 2) => next, 1);
    return {mobileStep, goToNextStep: () => setMobileStep(2), goToPreviousStep: () => setMobileStep(1)};
};
