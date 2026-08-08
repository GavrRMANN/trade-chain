import {useMemo} from 'react';
import {useNavigate} from 'react-router-dom';

import {useGetMyChainsQuery} from '@entities/chain';
import type {TChain, TChainStatus} from '@entities/chain';
import {useGetProductsQuery} from '@entities/product';
import type {TProduct} from '@entities/product';
import {useGetCurrentUserQuery} from '@entities/user';
import {getAuthToken} from '@shared/api';
import {usePageTitle} from '@app/providers/pageTitle';
import {useLayoutEffect} from 'react';

/** Статусы, считающиеся терминальными — обмен завершён и больше не активен. */
const FINAL_STATUSES: ReadonlySet<TChainStatus> = new Set<TChainStatus>([
    'completed',
    'cancelled',
    'rejected',
    'failed',
    'expired',
]);

export type TExchangeRow = {
    chain: TChain;
    fromProduct?: TProduct;
    toProduct?: TProduct;
};

export type TExchangeTab = 'incoming' | 'outgoing' | 'completed';

/**
 * Управляет данными, фильтрацией по вкладкам и навигацией страницы «Мои обмены».
 *
 * Деление по вкладкам сознательно упрощено во избежание неоднозначности
 * (терминальный обмен мог быть и входящим, и исходящим):
 *   — «Завершённые»: все цепочки с терминальным статусом (независимо от инициатора).
 *   — «Входящие»: незавершённые И инициатор — не текущий пользователь.
 *   — «Исходящие»: незавершённые И инициатор — текущий пользователь.
 */
export const useExchanges = () => {
    const {setTitle} = usePageTitle();
    const navigate = useNavigate();
    const isAuthenticated = Boolean(getAuthToken());

    const {data: currentUser} = useGetCurrentUserQuery(undefined, {
        skip: !isAuthenticated,
    });
    const currentUserId = currentUser?.customer_id ?? '';

    const {
        data: chains = [],
        isLoading: isChainsLoading,
        isFetching: isChainsFetching,
        isError: isChainsError,
    } = useGetMyChainsQuery(undefined, {skip: !isAuthenticated});

    const {data: products = []} = useGetProductsQuery(undefined, {
        skip: !isAuthenticated,
    });

    const productsById = useMemo(() => {
        const map = new Map<string, TProduct>();
        for (const product of products) {
            map.set(product.product_id, product);
        }
        return map;
    }, [products]);

    const buildRow = useMemo(() => {
        return (chain: TChain): TExchangeRow => ({
            chain,
            fromProduct: productsById.get(chain.from_product_id),
            toProduct: productsById.get(chain.to_product_id),
        });
    }, [productsById]);

    const {incoming, outgoing, completed} = useMemo(() => {
        const inc: TExchangeRow[] = [];
        const out: TExchangeRow[] = [];
        const done: TExchangeRow[] = [];

        for (const chain of chains) {
            if (FINAL_STATUSES.has(chain.status)) {
                done.push(buildRow(chain));
                continue;
            }

            if (chain.initiator_id === currentUserId) {
                out.push(buildRow(chain));
            } else {
                inc.push(buildRow(chain));
            }
        }

        return {incoming: inc, outgoing: out, completed: done};
    }, [chains, currentUserId, buildRow]);

    useLayoutEffect(() => {
        setTitle('Мои обмены');
    }, [setTitle]);

    const openExchange = (chainId: string) => {
        navigate(`/exchanges/${chainId}`);
    };

    return {
        isAuthenticated,
        currentUserId,
        incoming,
        outgoing,
        completed,
        isLoading: isChainsLoading,
        isFetching: isChainsFetching,
        isError: isChainsError,
        openExchange,
    };
};
