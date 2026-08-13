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

/**
 * Список желаний, создаваемый вместе с объявлением одним запросом.
 *
 * Без него новая вещь не участвует в подборе: и совпадения в ленте, и обход
 * цепочек строятся по категориям, которые владелец готов принять взамен.
 */
export type TCreateWishlistPayload = {
    /** Название списка — показывается в карточке товара. */
    name: string;
    /** Категории, которые владелец готов принять взамен. */
    category_ids: string[];
};

export type TCreateProductRequest = {
    /** Идентификатор владельца товара. */
    customer_id: string;
    /** Что владелец хочет взамен: создаётся вместе с объявлением. */
    wishlist?: TCreateWishlistPayload;
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
    /**
     * Владелец товара ищет что-то из того, что уже есть у текущего пользователя:
     * обмен возможен напрямую, без цепочки. Приходит только в ленте каталога и
     * только для авторизованного пользователя.
     */
    matched?: boolean;
    /** Товар текущего пользователя, который закрывает желание владельца. */
    matched_by_product_id?: string;
    /**
     * Отображаемое имя владельца товара. Как и `matched`, само объявление
     * этого поля не хранит — оно приходит только там, где экран уже
     * присоединяет владельца к товару (например, в вертикальной ленте),
     * без отдельного запроса на каждую карточку.
     */
    ownerName?: string;
    /** Название категории товара — приходит вместе с `category_id`, когда категория уже присоединена на экране. */
    categoryTitle?: string;
    /** Названия категорий, которые владелец хочет получить взамен (данные wishlist, присоединённые к карточке заранее). */
    wishedCategories?: string[];
};

/** Результат поиска маршрута обмена для выбранного товара. */
export type TProductRecommendations = {
    Products: TProduct[];
    Length: number;
};

/** Цель обмена — конкретный товар или категория. */
export type TTargetGoal = {
    productId?: string;
    categoryId?: string;
};
