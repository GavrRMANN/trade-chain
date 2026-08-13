import type {KeyboardEvent} from 'react';

import {useGetProductQuery} from '@entities/product';
import type {TProduct} from '@entities/product';

import {getRequiredAction} from '@entities/chain';
import type {TChain} from '@entities/chain';
import {useGetCurrentUserQuery} from '@entities/user';

import {useExchangeSeller} from './useExchangeSeller';

type TUseExchangeRowProps = {
    chain: TChain;
    fromProduct?: TProduct;
    toProduct?: TProduct;
    goalProduct?: TProduct;
    onOpen?: (chainId: string) => void;
};

/** Подготавливает данные и обработчики для компактной карточки обмена. */
export const useExchangeRow = ({
    chain,
    fromProduct: listedFromProduct,
    toProduct: listedToProduct,
    goalProduct: listedGoalProduct,
    onOpen,
}: TUseExchangeRowProps) => {
    // Каталог содержит только активные товары, поэтому историю подгружаем по ID.
    const fromProductQuery = useGetProductQuery(chain.from_product_id, {
        skip: Boolean(listedFromProduct),
    });
    const toProductQuery = useGetProductQuery(chain.to_product_id ?? '', {
        skip: Boolean(listedToProduct) || !chain.to_product_id,
    });
    const goalProductQuery = useGetProductQuery(chain.exchange_goal_id ?? '', {
        skip: Boolean(listedGoalProduct) || !chain.exchange_goal_id,
    });
    const fromProduct = listedFromProduct ?? fromProductQuery.data;
    const toProduct = listedToProduct ?? toProductQuery.data;
    const goalProduct = listedGoalProduct ?? goalProductQuery.data;
    const {sellerEmail} = useExchangeSeller(toProduct?.customer_id);
    const {data: currentUser} = useGetCurrentUserQuery();

    /* Подтверждения в списке не загружаются: строка обмена показывает
       требование по статусу, а точную стадию подтверждения — комната. */
    const requiredAction = getRequiredAction({
        chain,
        currentUserId: currentUser?.customer_id,
    });

    const open = () => onOpen?.(chain.chain_id);
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (!onOpen || (event.key !== 'Enter' && event.key !== ' ')) {
            return;
        }

        event.preventDefault();
        open();
    };

    return {
        fromProduct,
        toProduct,
        goalProduct,
        sellerEmail,
        requiredAction,
        interactive: Boolean(onOpen),
        open,
        handleKeyDown,
    };
};
