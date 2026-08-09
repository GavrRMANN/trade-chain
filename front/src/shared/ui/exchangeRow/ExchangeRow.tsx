import type {TChain} from '@entities/chain';
import type {TProduct} from '@entities/product';
import {ProductImage} from '@shared/ui/productImage';
import {StatusBadge} from '@shared/ui/statusBadge';
import {formatDate} from '@shared/lib';

import Styles from './ExchangeRow.module.css';

export type TExchangeRowData = {
    chain: TChain;
    fromProduct?: TProduct;
    toProduct?: TProduct;
};

type TExchangeRowProps = {
    row: TExchangeRowData;
    onOpen?: (chainId: string) => void;
    className?: string;
};

const Thumb = ({product}: {product?: TProduct}) => {
    if (!product) {
        return (
            <div className={Styles['exchange-row__product']}>
                <ProductImage title="?" alt="Товар недоступен"/>
                <div className={Styles['exchange-row__product-info']}>
                    <p className={Styles['exchange-row__product-fallback']}>Товар недоступен</p>
                </div>
            </div>
        );
    }

    return (
        <div className={Styles['exchange-row__product']}>
            <ProductImage src={product.image} alt={product.title} title={product.title}/>
            <div className={Styles['exchange-row__product-info']}>
                <p className={Styles['exchange-row__product-title']}>{product.title}</p>
            </div>
        </div>
    );
};

/**
 * Компактная строка обмена: товар → товар + статус + дата.
 * Используется в «Мои обмены», профиле и центре уведомлений.
 */
export const ExchangeRow = ({row, onOpen, className}: TExchangeRowProps) => {
    const {chain, fromProduct, toProduct} = row;
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
            <div className={Styles['exchange-row__products']}>
                <Thumb product={fromProduct}/>
                <span className={Styles['exchange-row__arrow']} aria-hidden="true">→</span>
                <Thumb product={toProduct}/>
            </div>
            <div className={Styles['exchange-row__meta']}>
                <StatusBadge status={chain.status}/>
                <span className={Styles['exchange-row__date']}>
                    {formatDate(chain.created_at)}
                </span>
            </div>
        </div>
    );
};
