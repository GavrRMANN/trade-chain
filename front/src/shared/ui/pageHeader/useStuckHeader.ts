import { useEffect, useState, type RefObject } from 'react';

/**
 * Сообщает, прилипла ли шапка страницы к верхней панели.
 *
 * Слушаем прокрутку окна, а не IntersectionObserver: у sticky-элемента нет
 * якоря, к которому можно привязать наблюдатель, а заводить ради этого
 * пустой элемент-сенсор в потоке нельзя — родитель раскладывает детей через
 * gap и добавил бы лишний отступ.
 */
export const useStuckHeader = (ref: RefObject<HTMLElement | null>) => {
    const [isStuck, setIsStuck] = useState(false);

    useEffect(() => {
        const node = ref.current;

        if (!node) {
            return;
        }

        /* Высоту верхней панели читаем не на каждом событии прокрутки:
           getComputedStyle заставляет пересчитывать стили, а меняется
           значение только при смене брейкпоинта. */
        let offset = 0;

        const readOffset = () => {
            offset =
                Number.parseFloat(
                    getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
                ) || 0;
        };

        const check = () => setIsStuck(node.getBoundingClientRect().top <= offset + 1);

        const handleResize = () => {
            readOffset();
            check();
        };

        handleResize();

        window.addEventListener('scroll', check, { passive: true });
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('scroll', check);
            window.removeEventListener('resize', handleResize);
        };
    }, [ref]);

    return isStuck;
};
