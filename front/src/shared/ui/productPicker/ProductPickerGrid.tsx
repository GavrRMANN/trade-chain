import { ProductCard } from '@entities/product';
import type { TProduct } from '@entities/product';

import Styles from './product-picker-grid.module.css';

type TProductPickerGridProps = {
    products: TProduct[];
    selectedProductId?: string;
    onSelect: (productId: string) => void;
};

/** Список товаров пользователя в виде выбираемых карточек. */
export const ProductPickerGrid = ({ products, selectedProductId, onSelect }: TProductPickerGridProps) => (
    <div className={Styles.grid}>
        {products.map((product) => (
            <button
                key={product.product_id}
                type="button"
                className={[
                    Styles.item,
                    selectedProductId === product.product_id && Styles['item--selected'],
                ]
                    .filter(Boolean)
                    .join(' ')}
                onClick={() => onSelect(product.product_id)}
                aria-pressed={selectedProductId === product.product_id}
            >
                <ProductCard
                    title={product.title}
                    img={product.image}
                    price={product.price}
                    location={product.location}
                    variant="horizontal"
                />
            </button>
        ))}
    </div>
);
