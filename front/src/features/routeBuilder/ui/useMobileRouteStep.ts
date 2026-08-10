import {useState} from 'react';

export const useMobileRouteStep = () => {
    const [mobileStep, setMobileStep] = useState<1 | 2>(1);
    return {mobileStep, goToNextStep: () => setMobileStep(2), goToPreviousStep: () => setMobileStep(1)};
};
