import type { TChain } from '@entities/chain';
import type { TProduct } from '@entities/product';
import { ChainStatusBadge, RequiredAction } from '@entities/chain';
import { formatDate } from '@shared/lib';

import Styles from './ExchangeRow.module.css';
import { ExchangeProducts } from './ExchangeProducts';
import { useExchangeRow } from './useExchangeRow';

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
    const {
        chain,
        fromProduct: listedFromProduct,
        toProduct: listedToProduct,
        goalProduct: listedGoalProduct,
    } = row;
    const {
        fromProduct,
        toProduct,
        goalProduct,
        sellerEmail,
        requiredAction,
        interactive,
        open,
        handleKeyDown,
    } = useExchangeRow({
        chain,
        fromProduct: listedFromProduct,
        toProduct: listedToProduct,
        goalProduct: listedGoalProduct,
        onOpen,
    });
    const classes = [Styles['exchange-row'], className].filter(Boolean).join(' ');

    return (
        <div
            className={classes}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            onClick={interactive ? open : undefined}
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
            <ExchangeProducts
                first={{
                    product: toProduct,
                    label: 'Получаю',
                    sellerEmail,
                    tone: 'target',
                }}
                second={{ product: fromProduct, label: 'Отдаю', tone: 'source' }}
            />
            <RequiredAction action={requiredAction} />
            {chain.message && <p className={Styles['exchange-row__message']}>{chain.message}</p>}
        </div>
    );
};
