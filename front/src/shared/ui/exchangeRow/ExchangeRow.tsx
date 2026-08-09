import type { TChain } from '@entities/chain';
import { useGetCustomerQuery } from '@entities/customer';
import type { TProduct } from '@entities/product';
import { ProductImage } from '@shared/ui/productImage';
import { StatusBadge } from '@shared/ui/statusBadge';
import { ExchangeDirection } from '@shared/ui/exchangeDirection';
import { formatAmount, formatDate } from '@shared/lib';

import Styles from './ExchangeRow.module.css';

export type TExchangeRowData = {
    chain: TChain;
    fromProduct?: TProduct;
    toProduct?: TProduct;
    goalProduct?: TProduct;
};

type TExchangeRowProps = {
    row: TExchangeRowData;
    onOpen?: (chainId: string) => void;
    className?: string;
};

type TProductCardProps = {
    product?: TProduct;
    label: string;
    sellerEmail?: string;
    tone: 'target' | 'source';
};

const ProductCard = ({ product, label, sellerEmail, tone }: TProductCardProps) => {
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

/**
 * Карточка обмена с товарами, статусом и датой.
 * Используется в «Мои обмены», профиле и центре уведомлений.
 */
export const ExchangeRow = ({ row, onOpen, className }: TExchangeRowProps) => {
    const { chain, fromProduct, toProduct, goalProduct } = row;
    const { data: toProductSeller } = useGetCustomerQuery(toProduct?.customer_id ?? '', {
        skip: !toProduct?.customer_id,
    });
    const classes = [Styles['exchange-row'], className].filter(Boolean).join(' ');

    const interactive = Boolean(onOpen);
    const handleOpen = onOpen ? () => onOpen(chain.chain_id) : undefined;
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (!onOpen) {
            return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onOpen(chain.chain_id);
        }
    };

    return (
        <div
            className={classes}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            onClick={handleOpen}
            onKeyDown={handleKeyDown}
        >
            <div className={Styles['exchange-row__meta']}>
                <div className={Styles['exchange-row__meta-main']}>
                    <StatusBadge status={chain.status} />
                    <span className={Styles['exchange-row__chain-label']}>
                        <span>Цепочка</span>
                        {goalProduct?.title ?? 'Цель недоступна'}
                    </span>
                </div>
                <span className={Styles['exchange-row__date']}>{formatDate(chain.created_at)}</span>
            </div>
            <div className={Styles['exchange-row__products']}>
                <ProductCard
                    product={toProduct}
                    label="Получаю"
                    sellerEmail={toProductSeller?.email}
                    tone="target"
                />
                <div className={Styles['exchange-row__connector']}>
                    <ExchangeDirection />
                </div>
                <ProductCard product={fromProduct} label="Отдаю" tone="source" />
            </div>
            {chain.message && <p className={Styles['exchange-row__message']}>{chain.message}</p>}
        </div>
    );
};
