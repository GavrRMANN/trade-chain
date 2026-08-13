import type { TProduct } from '@entities/product';

export type TFindChainRequest = {
	    /** Идентификатор выбранного стартового товара пользователя. */
	    source_product_id: string;
    /** Идентификатор товара, к которому нужно построить цепочку. */
    target_product_id: string;
    /** Максимальная глубина поиска цепочки. */
    max_depth?: number;
};

export type TFindChainResponse = {
    /** Товары, входящие в найденную цепочку. */
    chain: TProduct[];
    /** Количество звеньев найденной цепочки. */
    length: number;
};

export type TFindCandidatesRequest = {
    /** Идентификатор товара, для которого подбирается следующий шаг обмена. */
    product_id: string;
    /** Максимальное число кандидатов. */
    limit?: number;
    /**
     * Оставить только вещи с прямым обменом.
     *
     * Совпадение по вишлисту — то же ребро графа, по которому ищется цепочка:
     * без флага сервер добирает выдачу остальным каталогом, и в подборку
     * попадают товары, обмен с которыми к цели не ведёт.
     */
    direct?: boolean;
};

export type TFindCandidatesResponse = {
    /** Подобранные товары: сперва совпадения по вишлисту, затем остальные. */
    products: TProduct[];
};
