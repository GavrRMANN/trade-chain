import type { TChain } from '@entities/chain';
import type { TProduct } from '@entities/product';
import { ChainStatusBadge } from '@entities/chain';
import { ExchangeDirection } from '@shared/ui/exchangeDirection';
import { formatDate } from '@shared/lib';

import Styles from './ExchangeRow.module.css';
import { ProductCard } from './ProductCard';
import { useExchangeSeller } from './useExchangeSeller';

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

/**
 * Карточка обмена с товарами, статусом и датой.
 * Используется в «Мои обмены», профиле и центре уведомлений.
 */
export const ExchangeRow = ({ row, onOpen, className }: TExchangeRowProps) => {
    const { chain, fromProduct, toProduct, goalProduct } = row;
    const { sellerEmail } = useExchangeSeller(toProduct?.customer_id);
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
                    <ChainStatusBadge status={chain.status} />
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
                    sellerEmail={sellerEmail}
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
