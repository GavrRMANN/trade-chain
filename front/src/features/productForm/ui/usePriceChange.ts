import {useCallback} from 'react';

import {sanitizePrice} from '@shared/lib';

export const usePriceChange = (setPrice: (value: string) => void) =>
    useCallback((value: string) => setPrice(sanitizePrice(value)), [setPrice]);
