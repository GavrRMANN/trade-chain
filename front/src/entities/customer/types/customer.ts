export type TCustomer = {
    /** Уникальный идентификатор клиента. */
    customer_id: string;
    /** Электронная почта клиента. */
    email: string;
    /** ФИО клиента. Пустая строка, если не заполнено. */
    full_name: string;
    /** Дата создания профиля в ISO 8601. */
    created_at: string;
    /** Дата последнего обновления профиля в ISO 8601. */
    updated_at: string;
};

/**
 * Клиент вместе с показателями его активности на площадке.
 *
 * Рейтинг и счётчики бэкенд считает из отзывов, товаров и цепочек, а не
 * хранит полями, поэтому они приходят только этим эндпоинтом и отсутствуют
 * в обычной карточке клиента.
 */
export type TCustomerOverview = {
    /** Уникальный идентификатор клиента. */
    customer_id: string;
    /** Электронная почта клиента. */
    email: string;
    /** ФИО клиента. Пустая строка, если не заполнено. */
    full_name: string;
    /** Средняя оценка из отзывов, 0 при их отсутствии. */
    rating: number;
    /** Количество полученных отзывов. */
    review_count: number;
    /** Все товары клиента, включая архивные и обменянные. */
    product_count: number;
    /** Товары, доступные к обмену прямо сейчас. */
    active_product_count: number;
    /** Цепочки обмена с участием клиента в любом статусе. */
    chain_count: number;
    /** Дата создания профиля в ISO 8601. */
    created_at: string;
};

export type TCreateCustomerRequest = {
    /** Электронная почта нового клиента. */
    email: string;
    /** Пароль нового клиента. */
    password: string;
    /** ФИО нового клиента. */
    full_name?: string;
};

export type TUpdateCustomerRequest = {
    /** Новая электронная почта клиента. */
    email?: string;
    /** Новый пароль клиента. */
    password?: string;
    /** Новое ФИО клиента. */
    full_name?: string;
};

export type TCustomerListRequest = {
    /** Количество пропускаемых клиентов. */
    offset?: number;
    /** Максимальное количество клиентов в ответе. */
    limit?: number;
};
