import type { TProduct } from '@entities/product';
import { ProductImage } from '@shared/ui/productImage';
import { formatAmount } from '@shared/lib';

import Styles from './ExchangeRow.module.css';

type TProductCardProps = {
    product?: TProduct;
    label: string;
    sellerEmail?: string;
    tone: 'target' | 'source';
};

export const ProductCard = ({ product, label, sellerEmail, tone }: TProductCardProps) => {
    const title = product?.title ?? 'Товар недоступен';
    const price = product?.price === undefined ? 'Цена не указана' : formatAmount(product.price);
    const location = product?.location ?? 'Город не указан';
    const classes = [
        Styles['exchange-row__product'],
        Styles[`exchange-row__product--${tone}`],
    ].join(' ');

    return (
        <div className={classes}>
            <p className={Styles['exchange-row__product-label']}>{label}</p>
            <div className={Styles['exchange-row__product-info']}>
                <div className={Styles['exchange-row__product-media']}>
                    <ProductImage src={product?.image} alt={title} title={title} />
                </div>
                <div className={Styles['exchange-row__product-details']}>
                    <p className={Styles['exchange-row__product-title']}>{title}</p>
                    {sellerEmail && (
                        <p className={Styles['exchange-row__seller']}>Продавец: {sellerEmail}</p>
                    )}
                </div>
                <div className={Styles['exchange-row__product-meta']}>
                    <span className={Styles['exchange-row__product-price']}>{price}</span>
                    <span>{location}</span>
                </div>
            </div>
        </div>
    );
};
