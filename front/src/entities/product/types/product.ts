export type TProductStatus = 'active' | 'reserved' | 'exchanged' | 'archived';

export type TProductListRequest = {
    /** Поисковая строка по товарам. */
    q?: string;
    /** Фильтр по идентификатору категории. */
    category_id?: string;
    /** Количество пропускаемых записей. */
    offset?: number;
    /** Максимальное количество записей в ответе. */
    limit?: number;
};

export type TCreateProductRequest = {
    /** Идентификатор владельца товара. */
    customer_id: string;
    /** Идентификатор категории товара. */
    category_id?: string;
    /** Заголовок объявления. */
    title: string;
    /** Описание товара. */
    description?: string;
    /** URL изображения товара. */
    image?: string;
    /** Цена товара в рублях. */
    price?: number;
    /** Местоположение товара. */
    location?: string;
    /** Начальный статус товара. */
    status?: TProductStatus;
};

export type TUpdateProductRequest = {
    /** Новое название объявления. */
    title?: string;
    /** Новое описание товара. */
    description?: string;
    /** Новая категория товара. */
    category_id?: string;
    /** Новый URL изображения. */
    image?: string;
    /** Новая цена товара в рублях. */
    price?: number;
    /** Новое местоположение товара. */
    location?: string;
    /** Новый статус товара. */
    status?: TProductStatus;
};

export type TProduct = {
    /** Уникальный идентификатор товара. */
    product_id: string;
    /** Идентификатор владельца товара. */
    customer_id: string;
    /** Идентификатор категории товара. */
    category_id?: string;
    /** Заголовок объявления. */
    title: string;
    /** Описание товара. */
    description?: string;
    /** URL изображения товара. */
    image?: string;
    /** Цена товара в рублях. */
    price?: number;
    /** Местоположение товара. */
    location?: string;
    /** Текущий статус товара. */
    status: TProductStatus;
    /** Дата создания товара в ISO 8601. */
    created_at: string;
    /** Дата последнего обновления товара в ISO 8601. */
    updated_at: string;
};

/** Результат поиска маршрута обмена для выбранного товара. */
export type TProductRecommendations = {
    Products: TProduct[];
    Length: number;
};
