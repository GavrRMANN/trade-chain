import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type KeyboardEvent,
} from 'react';

/** Каждая карточка помечена этим атрибутом — так навигация не зависит от хешей CSS Module. */
const ITEM_SELECTOR = '[data-feed-item]';

/** Небольшой зазор снизу, чтобы лента не упиралась в край окна. */
const BOTTOM_GAP = 16;

type TProductFeedPosition = {
    /** Карточка, с которой открыть ленту, — например, сохранённая позиция. */
    initialIndex?: number;
    /**
     * Ключ списка: при его смене лента считается другой и открывается
     * сначала. Без него смена фильтра оставляла бы прокрутку от прежней
     * выдачи, где карточек было больше.
     */
    positionKey?: string;
    /** Вызывается при переходе на другую карточку — с её индексом. */
    onActiveIndexChange?: (index: number) => void;
};

/** Смещения карточек внутри контейнера ленты — точки снапа. */
const getItemOffsets = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).map(
        (item) => item.offsetTop - container.offsetTop,
    );

/** Индекс карточки, ближайшей к текущей прокрутке ленты. */
const getActiveIndex = (offsets: number[], scrollTop: number) =>
    offsets.reduce(
        (closest, offset, index) =>
            Math.abs(offset - scrollTop) < Math.abs(offsets[closest] - scrollTop) ? index : closest,
        0,
    );

/**
 * Управляет навигацией по вертикальной ленте, её позицией и состоянием
 * «свёрнуто/раскрыто» для описаний карточек.
 *
 * Сам скролл и снап карточек по экрану делает CSS (`scroll-snap-type`) —
 * хук только следит, какая карточка сейчас активна, и переводит клавиатурные
 * события в переход к соседней карточке. Свайп пальцем тоже листает ленту
 * нативно, через обычный скролл контейнера: специальный pointer-обработчик
 * тут не нужен и не должен ничего "предлагать" или "пропускать" за пользователя.
 *
 * @param itemsCount Число карточек в ленте.
 * @param position Позиция, с которой открыть ленту, и приёмник изменений.
 */
export const useProductFeed = (itemsCount: number, position: TProductFeedPosition = {}) => {
    const { initialIndex = 0, positionKey = '', onActiveIndexChange } = position;
    const containerRef = useRef<HTMLDivElement>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [viewportHeight, setViewportHeight] = useState<number>();
    /* Ключ списка, для которого позиция уже выставлена: пока лента не встала
       на нужную карточку, её собственные события прокрутки не считаются
       выбором пользователя и наружу не уходят. */
    const restoredKeyRef = useRef<string>();

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

        /* Блок над лентой (шапка страницы) может поменять высоту уже после
           этого замера — прилипнув, перенеся строку меты на вторую строку
           или дождавшись шрифта. Ни одно из этих событий не шлёт window
           resize, поэтому высоту ленты держит наблюдатель за самим
           документом: он ловит изменение высоты именно то, что двигает
           верх ленты. */
        const bodyObserver = new ResizeObserver(updateHeight);
        bodyObserver.observe(document.body);

        return () => {
            window.removeEventListener('resize', updateHeight);
            bodyObserver.disconnect();
        };
    }, [itemsCount]);

    /* Возврат к сохранённой карточке — до первой отрисовки кадра: иначе
       пользователь успевал бы увидеть начало ленты и прыжок от него.
       Ждать приходится двух вещей — измеренной высоты вьюпорта (от неё
       зависят точки снапа) и самих карточек, которые страница восстанавливает
       из своего снимка. */
    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container || viewportHeight === undefined) return;
        if (restoredKeyRef.current === positionKey) return;

        const offsets = getItemOffsets(container);
        if (offsets.length === 0 || (initialIndex > 0 && offsets.length <= initialIndex)) return;

        restoredKeyRef.current = positionKey;
        container.scrollTo({
            top: offsets[Math.min(initialIndex, offsets.length - 1)],
            behavior: 'auto',
        });
    }, [initialIndex, itemsCount, positionKey, viewportHeight]);

    /* Обработчик прокрутки живёт отдельно от отрисовки: активная карточка
       нужна странице для снимка позиции, а перерисовывать ленту на каждое
       движение пальца ради этого нельзя.

       Число карточек в зависимостях — не ради самих карточек, а ради
       контейнера: до первой загрузки лента показывает пустое состояние,
       и вешать обработчик ещё не на что. */
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !onActiveIndexChange) return;

        let frameId = 0;
        let reportedIndex = -1;

        const report = () => {
            frameId = 0;

            const index = getActiveIndex(getItemOffsets(container), container.scrollTop);
            if (index !== reportedIndex) {
                reportedIndex = index;
                onActiveIndexChange(index);
            }
        };

        const handleScroll = () => {
            if (frameId || restoredKeyRef.current !== positionKey) return;

            frameId = window.requestAnimationFrame(report);
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            container.removeEventListener('scroll', handleScroll);

            /* Уход со страницы обычно и случается сразу после листания: если
               последнее движение ещё ждёт своего кадра, позиция считается
               здесь — иначе лента вернулась бы на карточку назад. */
            if (frameId) {
                window.cancelAnimationFrame(frameId);
                report();
            }
        };
    }, [itemsCount, onActiveIndexChange, positionKey]);

    /* Активная карточка вычисляется из текущего скролла, а не хранится
       отдельным состоянием: наблюдатель за видимостью обновлялся бы
       асинхронно, и два быстрых нажатия подряд листали бы на один шаг. */
    const scrollToNeighbour = useCallback((direction: 1 | -1) => {
        const container = containerRef.current;
        if (!container) return;

        const offsets = getItemOffsets(container);
        if (offsets.length === 0) return;

        const activeIndex = getActiveIndex(offsets, container.scrollTop);
        const nextIndex = Math.max(0, Math.min(activeIndex + direction, offsets.length - 1));

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
