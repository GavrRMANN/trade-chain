export type TCustomerRecommendation = {
    /** Идентификатор клиента, которому принадлежит рекомендация. */
    customer_id: string;
    /** Идентификатор интересующей категории. */
    category_id: string;
};

export type TUpdateCustomerRecommendationsRequest = {
    /** Идентификаторы категорий, из которых складывается вишлист клиента. */
    category_ids: string[];
};
