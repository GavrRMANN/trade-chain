export interface Category {
    category_id: string;
    name: string;
    parent_id?: string;
    created_at: string;
    updated_at: string;
}

export type TCreateCategoryRequest = {
    name: string;
    parent_id?: string;
};

export type TUpdateCategoryRequest = TCreateCategoryRequest;
