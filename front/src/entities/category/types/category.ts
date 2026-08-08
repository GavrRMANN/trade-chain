export interface Category {
    /** Уникальный идентификатор категории. */
    category_id: string;
    /** Название категории. */
    name: string;
    /** Идентификатор родительской категории. */
    parent_id?: string;
    /** Дата создания категории в ISO 8601. */
    created_at: string;
    /** Дата последнего обновления категории в ISO 8601. */
    updated_at: string;
}

export type TCreateCategoryRequest = {
    /** Название новой категории. */
    name: string;
    /** Идентификатор родительской категории. */
    parent_id?: string;
};

export type TUpdateCategoryRequest = {
    /** Новое название категории. */
    name: string;
    /** Новый идентификатор родительской категории. */
    parent_id?: string;
};
