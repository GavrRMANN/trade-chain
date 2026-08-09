import { useGetRecommendationsQuery } from '@entities/product';
import { useGetCurrentUserQuery } from '@entities/user';
import { getAuthToken } from '@shared/api';
import { useOpenModalRoute } from '@shared/lib';
import { usePageTitle } from '@app/providers/pageTitle';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import type { TChainNode } from '@shared/ui/chainRow';

/**
 * Управляет данными маршрута обмена: цепочкой товаров,
 * текущим пользователем и навигацией по обменам.
 */
export const useRoute = () => {
    const { setTitle } = usePageTitle();
    const navigate = useNavigate();
    const openModal = useOpenModalRoute();
    const [searchParams] = useSearchParams();

    const targetId = searchParams.get('target')?.trim() ?? '';
    const isAuthenticated = Boolean(getAuthToken());

    const { data, isLoading, isError } = useGetRecommendationsQuery(targetId, {
        skip: !targetId,
    });

    const { data: currentUser } = useGetCurrentUserQuery(undefined, {
        skip: !isAuthenticated,
    });

    const [firstHopTarget, setFirstHopTarget] = useState<string>();
    const [directTarget, setDirectTarget] = useState<string>();

    useLayoutEffect(() => {
        setTitle('Маршрут обмена');
    }, [setTitle]);

    // Бекенд отдаёт цепочку сверху вниз: желанный товар вверху, наш — внизу.
    // Приводим к порядку «от нашего (первый) к желанному (последний)».
    const chain = useMemo(() => [...(data?.Products ?? [])].reverse(), [data?.Products]);
    const length = data?.Length ?? 0;

    const nodes = useMemo<TChainNode[]>(() => {
        if (chain.length === 0) {
            return [];
        }

        return chain.map((product, index) => ({
            product,
            isCurrent: index === 0,
            isGoal: index === chain.length - 1,
        }));
    }, [chain]);

    const firstHopId = chain.length >= 2 ? chain[1]?.product_id : undefined;
    const goalId = chain.length > 0 ? chain[chain.length - 1]?.product_id : targetId;

    const hasHop = Boolean(firstHopId);
    const isEmpty = !isLoading && !isError && (chain.length === 0 || length <= 1);

    const openProduct = useCallback(
        (productId: string) => {
            navigate(`/product/${productId}`);
        },
        [navigate],
    );

    const openFirstHopOffer = useCallback(() => {
        if (!firstHopId) {
            return;
        }
        setFirstHopTarget(firstHopId);
    }, [firstHopId]);

    const openGoalOffer = useCallback(() => {
        if (!goalId) {
            return;
        }
        setDirectTarget(goalId);
    }, [goalId]);

    const closeOffer = useCallback(() => {
        setFirstHopTarget(undefined);
        setDirectTarget(undefined);
    }, []);

    const handleOfferSuccess = useCallback(
        (chainId?: string) => {
            setFirstHopTarget(undefined);
            setDirectTarget(undefined);
            navigate(chainId ? `/exchanges/${chainId}` : '/exchanges');
        },
        [navigate],
    );

    const goHome = useCallback(() => {
        navigate('/');
    }, [navigate]);

    return {
        targetId,
        isAuthenticated,
        nodes,
        chain,
        isLoading,
        isError,
        hasHop,
        isEmpty,
        firstHopTarget,
        directTarget,
        goalId,
        currentCustomerId: currentUser?.customer_id,
        openProduct,
        openFirstHopOffer,
        openGoalOffer,
        closeOffer,
        handleOfferSuccess,
        goHome,
        openAuthModal: () => openModal('auth'),
    };
};
