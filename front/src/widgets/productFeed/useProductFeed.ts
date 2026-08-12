import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';

/** Каждая карточка помечена этим атрибутом — так навигация не зависит от хешей CSS Module. */
const ITEM_SELECTOR = '[data-feed-item]';

/** Небольшой зазор снизу, чтобы лента не упиралась в край окна. */
const BOTTOM_GAP = 16;

/**
 * Управляет навигацией по вертикальной ленте и состоянием «свёрнуто/раскрыто»
 * для описаний карточек.
 *
 * Сам скролл и снап карточек по экрану делает CSS (`scroll-snap-type`) —
 * хук только следит, какая карточка сейчас активна, и переводит клавиатурные
 * события в переход к соседней карточке. Свайп пальцем тоже листает ленту
 * нативно, через обычный скролл контейнера: специальный pointer-обработчик
 * тут не нужен и не должен ничего "предлагать" или "пропускать" за пользователя.
 */
export const useProductFeed = (itemsCount: number) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [viewportHeight, setViewportHeight] = useState<number>();

    /* Высота ленты считается от её собственного положения на странице:
       над ней живут шапка экрана и фильтр категорий, а общий контейнер
       приложения растягивается по контенту, поэтому вычесть их из 100dvh
       заранее нельзя — получилась бы лента, уезжающая под нижний край. */
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateHeight = () => {
            const { top } = container.getBoundingClientRect();
            const bottomInset =
                Number.parseFloat(
                    getComputedStyle(document.documentElement).getPropertyValue(
                        '--mobile-nav-height',
                    ),
                ) || 0;

            /* На телефоне лента идёт встык с нижней навигацией: полноэкранный
               формат не терпит белой полосы под карточкой. На desktop зазор
               остаётся — там лента лежит на странице, а не занимает её. */
            const bottomGap = bottomInset > 0 ? 0 : BOTTOM_GAP;

            setViewportHeight(Math.max(320, window.innerHeight - top - bottomInset - bottomGap));
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, [itemsCount]);

    /* Активная карточка вычисляется из текущего скролла, а не хранится
       отдельным состоянием: наблюдатель за видимостью обновлялся бы
       асинхронно, и два быстрых нажатия подряд листали бы на один шаг. */
    const scrollToNeighbour = useCallback((direction: 1 | -1) => {
        const container = containerRef.current;
        if (!container) return;

        const items = Array.from(container.querySelectorAll<HTMLElement>(ITEM_SELECTOR));
        if (items.length === 0) return;

        const offsets = items.map((item) => item.offsetTop - container.offsetTop);
        const activeIndex = offsets.reduce(
            (closest, offset, index) =>
                Math.abs(offset - container.scrollTop) <
                Math.abs(offsets[closest] - container.scrollTop)
                    ? index
                    : closest,
            0,
        );
        const nextIndex = Math.max(0, Math.min(activeIndex + direction, items.length - 1));

        /* Переход мгновенный, как и снап при свайпе: плавная анимация здесь
           только растянула бы смену карточки и разошлась бы с тем, что
           пользователь видит при листании пальцем.
           Скроллим сам контейнер, а не элемент через scrollIntoView —
           последний волен прокрутить и родителей. */
        container.scrollTo({ top: offsets[nextIndex], behavior: 'auto' });
    }, []);

    // Обработчик висит на самом контейнере ленты (tabIndex на нём), а не на
    // window: клавиатура должна листать карточки только тогда, когда фокус
    // действительно внутри ленты.
    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'ArrowDown' || event.key === 'PageDown') {
                event.preventDefault();
                scrollToNeighbour(1);
            } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
                event.preventDefault();
                scrollToNeighbour(-1);
            }
        },
        [scrollToNeighbour],
    );

    // Раскрытие описания хранится отдельно на карточку: разворачивая одну,
    // соседние не должны менять высоту и сбивать точки снапа.
    const toggleDescription = useCallback((productId: string) => {
        setExpandedIds((current) => {
            const next = new Set(current);
            if (next.has(productId)) {
                next.delete(productId);
            } else {
                next.add(productId);
            }
            return next;
        });
    }, []);

    return { containerRef, viewportHeight, handleKeyDown, expandedIds, toggleDescription };
};
