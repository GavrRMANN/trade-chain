export type TCategoryListRequest = {
    parent_id?: string;
};

export interface Category {
    category_id: string;
    name: string;
    parent_id?: string;
}
