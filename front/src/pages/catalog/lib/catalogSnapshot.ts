import type { TProduct } from '@entities/product';

/**
 * Снимок каталога: что уже подгружено и где остановился пользователь.
 *
 * Каталог — единственный экран с бесконечной прокруткой, поэтому возврат на
 * него без снимка означает не только сброс прокрутки: список ужимается до
 * первой страницы, и восстанавливать позицию становится некуда.
 */
export type TCatalogSnapshot = {
    /** Все товары, показанные до ухода со страницы. */
    products: TProduct[];
    /** Смещение последней запрошенной страницы. */
    offset: number;
    hasMore: boolean;
    /** Индекс карточки, на которой стояла лента. */
    feedIndex: number;
    /** Прокрутка окна в режиме сетки, px. */
    scrollY: number;
};

type TStoredSnapshot = TCatalogSnapshot & { key: string };

/** Каталог, открытый впервые: ничего не загружено и не прокручено. */
const EMPTY_SNAPSHOT: TCatalogSnapshot = {
    products: [],
    offset: 0,
    hasMore: true,
    feedIndex: 0,
    scrollY: 0,
};

/* Снимок живёт в модуле, а не в sessionStorage: он нужен ровно на время
   жизни вкладки и хранит уже загруженные товары — сериализовать их в
   хранилище пришлось бы на каждое движение прокрутки. Перезагрузка страницы
   и так начинает каталог заново, вместе с кешем запросов. */
let stored: TStoredSnapshot | undefined;

/**
 * Возвращает снимок каталога для текущего фильтра.
 *
 * Ключ — поиск и категория: под другим фильтром показывается другой список,
 * и позиция от него не имеет смысла. Хранится только последний снимок —
 * смена фильтра всё равно перезагружает ленту с начала.
 *
 * @param key Ключ фильтра каталога.
 * @returns Сохранённый снимок либо пустой, если фильтр сменился.
 */
export const readCatalogSnapshot = (key: string): TCatalogSnapshot =>
    stored?.key === key ? stored : EMPTY_SNAPSHOT;

/**
 * Обновляет часть снимка каталога.
 * @param key Ключ фильтра каталога.
 * @param patch Изменившиеся поля снимка.
 */
export const saveCatalogSnapshot = (key: string, patch: Partial<TCatalogSnapshot>) => {
    stored = { ...readCatalogSnapshot(key), ...patch, key };
};
