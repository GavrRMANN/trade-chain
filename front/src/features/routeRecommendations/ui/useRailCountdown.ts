import { useEffect, useRef, useState } from 'react';

/**
 * Сколько карточек ряда ещё не выехало из-под закреплённой плитки перехода.
 *
 * Плитка стоит справа и не уезжает при прокрутке, поэтому под ней всегда
 * что-то спрятано, пока ряд не домотан. Отсчёт на самой плитке показывает,
 * сколько предложений там осталось: 3 → 2 → 1 → 0, и на нуле она сообщает,
 * что дальше только подборка.
 */
export const useRailCountdown = (itemCount: number) => {
    const railRef = useRef<HTMLDivElement>(null);
    const [remaining, setRemaining] = useState(0);

    useEffect(() => {
        const node = railRef.current;

        if (!node) {
            return;
        }

        const update = () => {
            /* Плитка — последний ребёнок ряда, карточки идут до неё. */
            const cards = [...node.children].slice(0, itemCount);
            const tile = node.children[itemCount] as HTMLElement | undefined;
            /* Граница, за которой карточка скрыта закреплённой плиткой.
               Допуск в пиксель — на дробные размеры при масштабировании. */
            const edge = node.getBoundingClientRect().right - (tile?.offsetWidth ?? 0) + 1;

            setRemaining(cards.filter((card) => card.getBoundingClientRect().right > edge).length);
        };

        update();

        node.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);

        return () => {
            node.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
        /* Пересчитываем и при смене состава ряда: от числа карточек зависит
           его ширина, а значит и то, есть ли что прятать под плиткой. */
    }, [itemCount]);

    return { railRef, remaining };
};
