import {ProductCard} from '@entities/product';
import type {TProduct} from '@entities/product';

import Styles from './catalog-page.module.css';

type TProductGridProps = {
    products: TProduct[];
    onOpen: (productId: string) => void;
};

export const ProductGrid = ({products, onOpen}: TProductGridProps) => (
    <div className={Styles.grid}>
        {products.map((product) => (
            <ProductCard
                key={product.product_id}
                title={product.title}
                img={product.image}
                price={product.price}
                location={product.location}
                matched={product.matched}
                onClick={() => onOpen(product.product_id)}
            />
        ))}
    </div>
);
