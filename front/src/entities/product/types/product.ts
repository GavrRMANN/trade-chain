export type TProductStatus = 'active' | 'reserved' | 'exchanged' | 'archived';

export type TProductListRequest = {
    q?: string;
    category_id?: string;
    page?: number;
    limit?: number;
};

export type TProductWishlistRequest = {
    name: string;
    category_ids: string[];
    allow_surcharge: boolean;
    max_surcharge?: number;
};

export type TCreateProductRequest = {
    category_id: string;
    name: string;
    description?: string;
    wishlist?: TProductWishlistRequest;
};

export type TUpdateProductRequest = {
    category_id?: string;
    name?: string;
    description?: string;
};

export type TProduct = {
    product_id: string;
    customer_id: string;
    category_id: string;
    category: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    location: string;
    image_url: string;
    status: TProductStatus;
    created_at: string;
    updated_at: string;
}

export type TProductsResponse = {
    items: TProduct[];
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}
