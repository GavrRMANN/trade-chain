export type TCustomer = {
    /** Уникальный идентификатор клиента. */
    customer_id: string;
    /** Электронная почта клиента. */
    email: string;
    /** Дата создания профиля в ISO 8601. */
    created_at: string;
    /** Дата последнего обновления профиля в ISO 8601. */
    updated_at: string;
};

export type TCreateCustomerRequest = {
    /** Электронная почта нового клиента. */
    email: string;
    /** Пароль нового клиента. */
    password: string;
};

export type TUpdateCustomerRequest = {
    /** Новая электронная почта клиента. */
    email?: string;
    /** Новый пароль клиента. */
    password?: string;
};

export type TCustomerListRequest = {
    /** Количество пропускаемых клиентов. */
    offset?: number;
    /** Максимальное количество клиентов в ответе. */
    limit?: number;
};
