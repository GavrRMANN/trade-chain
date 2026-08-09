import type { TProduct } from '@entities/product';

export type TFindChainRequest = {
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
