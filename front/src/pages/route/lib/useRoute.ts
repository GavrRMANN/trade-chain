import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { usePageTitle } from '@app/providers/pageTitle';
import { useCreateChainMutation, useGetMyChainsQuery } from '@entities/chain';
import type { TChain } from '@entities/chain';
import { useGetProductsQuery } from '@entities/product';
import type { TProduct } from '@entities/product';
import { useFindChainQuery } from '@entities/search';
import { useGetCurrentUserQuery } from '@entities/user';
import type { TRouteRecommendation } from '@features/routeRecommendations';

const OPEN_OFFER_STATUSES = new Set<TChain['status']>(['pending', 'active']);

type TRouteHistoryItem = {
    chain: TChain;
    product?: TProduct;
};

/** Управляет персональным маршрутом до цели и предложениями текущего этапа. */
export const useRoute = () => {
    const { setTitle } = usePageTitle();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const targetId = searchParams.get('target')?.trim() ?? '';
    const sourceId = searchParams.get('from')?.trim() ?? '';

    const routeQuery = useFindChainQuery(
        { target_product_id: targetId },
        { skip: !targetId },
    );
    const currentUserQuery = useGetCurrentUserQuery();
    const productsQuery = useGetProductsQuery(
        { limit: 100 },
        { skip: !targetId },
    );
    const myChainsQuery = useGetMyChainsQuery(undefined, {
        skip: !targetId,
    });
    const [createChain, { isLoading: isSubmitting }] = useCreateChainMutation();

    const [directTarget, setDirectTarget] = useState<string>();
    const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);
    const [submitError, setSubmitError] = useState<string>();
    const [submitMessage, setSubmitMessage] = useState<string>();

    useLayoutEffect(() => {
        setTitle('Путь к цели');
    }, [setTitle]);

    // Реальный поиск отдаёт «цель → текущий товар», а mock API — наоборот.
    // Ориентируем маршрут по известной цели, чтобы экран не зависел от окружения.
    const chain = useMemo(() => {
        const products = routeQuery.data?.chain ?? [];
        if (products.at(-1)?.product_id === targetId) {
            return [...products];
        }
        if (products[0]?.product_id === targetId) {
            return [...products].reverse();
        }
        return [...products];
    }, [routeQuery.data?.chain, targetId]);
    const currentCustomerId = currentUserQuery.data?.customer_id;

    const productsById = useMemo(() => {
        const map = new Map<string, TProduct>();
        for (const product of productsQuery.data ?? []) {
            map.set(product.product_id, product);
        }
        for (const product of chain) {
            map.set(product.product_id, product);
        }
        return map;
    }, [chain, productsQuery.data]);

    const routeSource = chain[0];
    const requestedSource = sourceId ? productsById.get(sourceId) : undefined;
    const selectedSource =
        requestedSource &&
        requestedSource.customer_id === currentCustomerId &&
        requestedSource.status === 'active'
            ? requestedSource
            : undefined;
    const currentProduct = selectedSource ?? routeSource;
    const goalProduct = productsById.get(targetId) ?? chain[chain.length - 1];
    const sourceMatchesRoute = currentProduct?.product_id === routeSource?.product_id;
    const firstHop = sourceMatchesRoute
        ? chain[1] ?? goalProduct
        : routeSource?.customer_id === currentCustomerId
          ? chain[1] ?? goalProduct
          : routeSource ?? goalProduct;
    const goalId = goalProduct?.product_id ?? targetId;
    const stepsRemaining = currentProduct?.product_id === goalId
        ? 0
        : Math.max(1, chain.length - 1);

    useEffect(() => {
        setSelectedTargetIds([]);
        setSubmitError(undefined);
        setSubmitMessage(undefined);
    }, [currentProduct?.product_id, goalId]);

    const stageOffers = useMemo(() => {
        if (!currentProduct) {
            return [];
        }

        return (myChainsQuery.data ?? [])
            .filter(
                (offer) =>
                    offer.initiator_id === currentCustomerId &&
                    offer.from_product_id === currentProduct.product_id &&
                    (offer.exchange_goal_id === goalId ||
                        (!offer.exchange_goal_id && offer.to_product_id === goalId)) &&
                    OPEN_OFFER_STATUSES.has(offer.status),
            )
            .sort((left, right) => right.updated_at.localeCompare(left.updated_at));
    }, [currentCustomerId, currentProduct, goalId, myChainsQuery.data]);

    const offerByTargetId = useMemo(() => {
        const map = new Map<string, TChain>();
        for (const offer of stageOffers) {
            if (!map.has(offer.to_product_id)) {
                map.set(offer.to_product_id, offer);
            }
        }
        return map;
    }, [stageOffers]);

    const recommendations = useMemo<TRouteRecommendation[]>(() => {
        if (!currentProduct || !firstHop) {
            return [];
        }

        const candidates = new Map<string, TProduct>();
        candidates.set(firstHop.product_id, firstHop);

        for (const offer of stageOffers) {
            const product = productsById.get(offer.to_product_id);
            if (product) {
                candidates.set(product.product_id, product);
            }
        }

        for (const product of productsQuery.data ?? []) {
            const isSameCategory = firstHop.category_id
                ? product.category_id === firstHop.category_id
                : product.product_id === firstHop.product_id;
            const isAvailable = product.status === 'active';
            const belongsToAnotherUser = product.customer_id !== currentCustomerId;
            const isDifferentProduct = product.product_id !== currentProduct.product_id;

            if (isSameCategory && isAvailable && belongsToAnotherUser && isDifferentProduct) {
                candidates.set(product.product_id, product);
            }

            if (candidates.size >= 8) {
                break;
            }
        }

        return [...candidates.values()].map((product) => ({
            product,
            offer: offerByTargetId.get(product.product_id),
        }));
    }, [
        currentCustomerId,
        currentProduct,
        firstHop,
        offerByTargetId,
        productsById,
        productsQuery.data,
        stageOffers,
    ]);

    const history = useMemo<TRouteHistoryItem[]>(() => {
        return (myChainsQuery.data ?? [])
            .filter(
                (item) =>
                    item.status === 'completed' &&
                    item.initiator_id === currentCustomerId &&
                    (item.exchange_goal_id === goalId ||
                        (!item.exchange_goal_id && item.to_product_id === goalId)),
            )
            .sort((left, right) => right.updated_at.localeCompare(left.updated_at))
            .map((item) => ({
                chain: item,
                product: productsById.get(item.from_product_id),
            }));
    }, [currentCustomerId, goalId, myChainsQuery.data, productsById]);

    const toggleRecommendation = useCallback((productId: string, selected: boolean) => {
        setSelectedTargetIds((current) => {
            if (selected) {
                return current.includes(productId) ? current : [...current, productId];
            }
            return current.filter((id) => id !== productId);
        });
        setSubmitError(undefined);
        setSubmitMessage(undefined);
    }, []);

    const submitSelectedOffers = useCallback(async () => {
        if (!currentProduct || selectedTargetIds.length === 0) {
            return;
        }

        setSubmitError(undefined);
        setSubmitMessage(undefined);

        const results = await Promise.allSettled(
            selectedTargetIds.map((productId) =>
                createChain({
                    from_product_id: currentProduct.product_id,
                    to_product_id: productId,
                    exchange_goal_id: goalId,
                    route_step_id: currentProduct.product_id,
                    status: 'pending',
                    message: `Предложение в рамках цели «${goalProduct?.title ?? 'Обмен до цели'}»`,
                }).unwrap(),
            ),
        );

        const succeededIds = selectedTargetIds.filter(
            (_, index) => results[index]?.status === 'fulfilled',
        );
        const failedIds = selectedTargetIds.filter(
            (_, index) => results[index]?.status === 'rejected',
        );

        if (succeededIds.length > 0) {
            setSubmitMessage(
                succeededIds.length === 1
                    ? 'Предложение отправлено. Ответ появится на этой странице.'
                    : `Отправлено предложений: ${succeededIds.length}. Ответы появятся на этой странице.`,
            );
            await myChainsQuery.refetch();
        }

        if (failedIds.length > 0) {
            setSubmitError(
                failedIds.length === selectedTargetIds.length
                    ? 'Не удалось отправить предложения. Попробуйте ещё раз.'
                    : `Не удалось отправить предложений: ${failedIds.length}. Их можно повторить.`,
            );
        }

        setSelectedTargetIds(failedIds);
    }, [createChain, currentProduct, goalId, goalProduct?.title, myChainsQuery, selectedTargetIds]);

    const openProduct = useCallback(
        (productId: string) => navigate(`/product/${productId}`),
        [navigate],
    );
    const openOffer = useCallback(
        (chainId: string) => navigate(`/exchanges/${chainId}`),
        [navigate],
    );
    const openGoalOffer = useCallback(() => {
        if (goalId) {
            setDirectTarget(goalId);
        }
    }, [goalId]);
    const closeOffer = useCallback(() => setDirectTarget(undefined), []);
    const handleOfferSuccess = useCallback(
        (chainId?: string) => {
            setDirectTarget(undefined);
            navigate(chainId ? `/exchanges/${chainId}` : '/exchanges');
        },
        [navigate],
    );
    const goHome = useCallback(() => navigate('/'), [navigate]);

    const isLoading = routeQuery.isLoading || productsQuery.isLoading || myChainsQuery.isLoading;
    const isError = routeQuery.isError || productsQuery.isError || myChainsQuery.isError;
    const isEmpty = !isLoading && !isError && (!currentProduct || !goalProduct);

    return {
        targetId,
        isLoading,
        isError,
        isEmpty,
        currentCustomerId,
        currentProduct,
        goalProduct,
        goalId,
        stepsRemaining,
        recommendations,
        selectedTargetIds,
        history,
        submitError,
        submitMessage,
        isSubmitting,
        directTarget,
        toggleRecommendation,
        submitSelectedOffers,
        openProduct,
        openOffer,
        openGoalOffer,
        closeOffer,
        handleOfferSuccess,
        goHome,
    };
};
