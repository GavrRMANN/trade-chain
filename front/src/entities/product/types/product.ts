export type TProductListRequest = {
    category_id?: string;
    offset?: number;
    limit?: number;
};

export type TCreateProductRequest = {
    customer_id: string;
    category_id?: string;
    name: string;
    description?: string;
};

export type TUpdateProductRequest = {
    category_id?: string;
    name?: string;
    description?: string;
    is_active?: boolean;
};

export type TProduct = {
    product_id: string;
    customer_id: string;
    category_id?: string;
    name: string;
    description?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};
