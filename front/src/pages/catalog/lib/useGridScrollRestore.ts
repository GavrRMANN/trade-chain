import { useEffect, useLayoutEffect, useRef } from 'react';

import { readCatalogSnapshot, saveCatalogSnapshot } from './catalogSnapshot';

/** Сколько кадров ждать, пока сетка дорастёт до сохранённой прокрутки. */
const RESTORE_FRAMES = 20;

type TGridScrollRestoreOptions = {
    /** Ключ фильтра каталога — под ним лежит снимок. */
    filtersKey: string;
    /** Сетка прокручивает окно; в ленте прокрутка своя, и хук молчит. */
    enabled: boolean;
    /** Число карточек в сетке: пока их меньше, восстанавливать некуда. */
    itemsCount: number;
};

/**
 * Возвращает каталог в режиме сетки на то же место при возврате на страницу.
 *
 * Прокручивается окно, а не контейнер: сетка — обычная длинная страница.
 * Собственная позиция вместо браузерного восстановления нужна потому, что
 * список каталога подгружается порциями — к моменту, когда браузер вернул бы
 * прокрутку, на странице лежит только первая страница товаров.
 *
 * @param options Ключ фильтра, режим и текущее число карточек.
 */
export const useGridScrollRestore = ({
    filtersKey,
    enabled,
    itemsCount,
}: TGridScrollRestoreOptions) => {
    const isRestoredRef = useRef(false);

    useLayoutEffect(() => {
        if (!enabled || isRestoredRef.current) return;

        const { scrollY } = readCatalogSnapshot(filtersKey);
        if (scrollY === 0 || itemsCount === 0) return;

        isRestoredRef.current = true;

        /* Карточки восстанавливаются из снимка сразу, но их высота зависит от
           картинок и шрифтов: пока страница не доросла, окно упирается в свой
           конец. Поэтому прокрутка повторяется несколько кадров подряд — до
           попадания в сохранённую точку. */
        let frame = 0;
        let frameId = 0;

        const restore = () => {
            window.scrollTo({ top: scrollY, behavior: 'auto' });
            frame += 1;

            if (Math.round(window.scrollY) < Math.round(scrollY) && frame < RESTORE_FRAMES) {
                frameId = window.requestAnimationFrame(restore);
            }
        };

        restore();
        return () => window.cancelAnimationFrame(frameId);
    }, [enabled, filtersKey, itemsCount]);

    useEffect(() => {
        if (!enabled) return;

        /* Обработчик прокрутки срабатывает часто, а снимок нужен только
           последний: запись откладывается до ближайшего кадра. */
        let frameId = 0;

        const save = () => {
            frameId = 0;
            saveCatalogSnapshot(filtersKey, { scrollY: window.scrollY });
        };

        const handleScroll = () => {
            if (frameId) return;

            frameId = window.requestAnimationFrame(save);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);

            /* Со страницы уходят сразу после прокрутки: отложенную запись
               нужно доделать здесь, иначе снимок отстанет на один кадр. */
            if (frameId) {
                window.cancelAnimationFrame(frameId);
                save();
            }
        };
    }, [enabled, filtersKey]);
};
