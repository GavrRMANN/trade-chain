export type TWishlist = {
    /** Уникальный идентификатор списка желаний. */
    wishlist_id: string;
    /** Идентификатор товара, для которого задан список желаний. */
    product_id: string;
    /** Текстовое описание желаемого товара. */
    name: string;
    /** Дата создания списка в ISO 8601. */
    created_at: string;
    /** Дата последнего обновления списка в ISO 8601. */
    updated_at: string;
};

export type TWishlistOption = {
    /** Идентификатор списка желаний. */
    wishlist_id: string;
    /** Идентификатор желаемой категории. */
    category_id: string;
};

export type TCreateWishlistRequest = {
    /** Идентификатор товара, для которого создаётся список. */
    product_id: string;
    /** Текстовое описание желаемого товара. */
    name: string;
};

export type TWishlistOptionRequest = {
    /** Идентификатор категории, добавляемой в список желаний. */
    category_id: string;
};
