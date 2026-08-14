import { useMemo } from 'react';

import type { TRouteRecommendation } from './RouteRecommendations';
import { useCarousel } from './useCarousel';
import { useSwipeGesture } from './useSwipeGesture';

export const useRouteRecommendations = (
    items: TRouteRecommendation[],
    selectedIds: string[],
    onToggle: (productId: string, selected: boolean) => void,
) => {
    const { activeIndex, current, advance } = useCarousel(items);
    const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
    const selectAndAdvance = () => {
        if (current && !current.offer) onToggle(current.product.product_id, true);
        advance();
    };
    const { handlePointerDown, handlePointerUp } = useSwipeGesture({
        onSwipeLeft: selectAndAdvance,
        onSwipeRight: advance,
    });
    return {
        activeIndex,
        current,
        selected,
        advance,
        selectAndAdvance,
        handlePointerDown,
        handlePointerUp,
    };
};
