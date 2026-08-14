import type { TProduct } from '@entities/product';
import { ExchangeDirection } from '@shared/ui/exchangeDirection';

import Styles from './ExchangeRow.module.css';
import { ProductCard } from './ProductCard';

type TExchangeProductSide = {
    product?: TProduct;
    label: string;
    tone: 'target' | 'source';
    sellerEmail?: string;
};

type TExchangeProductsProps = {
    first: TExchangeProductSide;
    second: TExchangeProductSide;
};

/** Отображает унифицированную пару товаров, участвующих в обмене. */
export const ExchangeProducts = ({ first, second }: TExchangeProductsProps) => (
    <div className={Styles['exchange-row__products']}>
        <ProductCard {...first} />
        <div className={Styles['exchange-row__connector']}>
            <ExchangeDirection />
        </div>
        <ProductCard {...second} />
    </div>
);
