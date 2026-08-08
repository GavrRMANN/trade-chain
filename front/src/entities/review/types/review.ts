export type TReview = {
    /** Уникальный идентификатор отзыва. */
    review_id: string;
    /** Идентификатор автора отзыва. */
    from_customer_id: string;
    /** Идентификатор пользователя, которому оставлен отзыв. */
    to_customer_id: string;
    /** Идентификатор связанного товара. */
    product_id?: string;
    /** Оценка пользователя. */
    rating: number;
    /** Текст отзыва. */
    comment?: string;
    /** Дата создания отзыва в ISO 8601. */
    created_at: string;
    /** Дата последнего обновления отзыва в ISO 8601. */
    updated_at: string;
};

export type TCreateReviewRequest = {
    /** Идентификатор автора отзыва. */
    from_customer_id: string;
    /** Идентификатор пользователя, которому оставлен отзыв. */
    to_customer_id: string;
    /** Идентификатор связанного товара. */
    product_id?: string;
    /** Оценка пользователя. */
    rating: number;
    /** Текст отзыва. */
    comment?: string;
};

export type TCustomerRatingResponse = {
    /** Средний рейтинг пользователя. */
    average_rating: number;
};
