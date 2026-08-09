import { useEffect, useMemo, useState } from 'react';

/**
 * Хук для управления каруселью/свайпером.
 * Возвращает текущий индекс, текущий элемент и функцию advance.
 */
export const useCarousel = <T>(items: T[]) => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (activeIndex >= items.length) {
            setActiveIndex(Math.max(0, items.length - 1));
        }
    }, [activeIndex, items.length]);

    const current = items[activeIndex];

    const advance = () => {
        setActiveIndex((index) => (items.length === 0 ? 0 : (index + 1) % items.length));
    };

    return { activeIndex, current, advance };
};
