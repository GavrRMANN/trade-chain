import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useGetCategoriesQuery } from '@entities/category';
import { buildChainPayload, useCreateChainMutation, useGetMyChainsQuery } from '@entities/chain';
import type { TChain } from '@entities/chain';
import { useGetProductsByCustomerQuery, useGetProductsQuery, useProductsById } from '@entities/product';
import type { TProduct } from '@entities/product';
import { useFindCandidatesQuery, useFindChainQuery } from '@entities/search';
import { useGetCurrentUserQuery } from '@entities/user';
import type { TRouteRecommendation } from '@features/routeRecommendations';
import { useOpenModalRoute } from '@shared/lib';

const OPEN_OFFER_STATUSES = new Set<TChain['status']>(['pending', 'active']);

type TRouteHistoryItem = {
    chain: TChain;
    product?: TProduct;
};

/** Управляет персональным маршрутом до цели и предложениями текущего этапа. */
export const useRoute = () => {
    const navigate = useNavigate();
    const openModalRoute = useOpenModalRoute();
    const [searchParams] = useSearchParams();

    const targetId = searchParams.get('target')?.trim() ?? '';
    const targetCategoryId = searchParams.get('targetCategory')?.trim() ?? '';
    const sourceId = searchParams.get('from')?.trim() ?? '';

    const routeQuery = useFindChainQuery(
        { source_product_id: sourceId, target_product_id: targetId },
        { skip: !targetId || !sourceId || Boolean(targetCategoryId), refetchOnMountOrArgChange: true },
    );
    const currentUserQuery = useGetCurrentUserQuery();
    const currentCustomerId = currentUserQuery.data?.customer_id;
    const categoriesQuery = useGetCategoriesQuery();
    const myProductsQuery = useGetProductsByCustomerQuery(currentCustomerId ?? '', {
        skip: !currentCustomerId,
        refetchOnMountOrArgChange: true,
    });
    /* Оба запроса нужны только со второго шага (когда стартовый товар уже
       выбран): без sourceId экран показывает лишь список своих объявлений,
       и загружать сюда весь каталог и историю цепочек незачем. */
    const productsQuery = useGetProductsQuery(
        { limit: 100 },
        { skip: (!targetId && !targetCategoryId) || !sourceId, refetchOnMountOrArgChange: true },
    );
    /* Цепочки маршрута обновляет SSE и собственные мутации страницы:
       принудительный перезапрос на каждом монтировании перезагружал их при
       любом возврате на экран, ничего при этом не меняя. */
    const myChainsQuery = useGetMyChainsQuery(undefined, {
        skip: (!targetId && !targetCategoryId) || !sourceId,
    });
    const [createChain, { isLoading: isSubmitting }] = useCreateChainMutation();

    const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);
    const [submitError, setSubmitError] = useState<string>();
    const [submitMessage, setSubmitMessage] = useState<string>();

    const chain = useMemo(() => {
        const products = routeQuery.data?.chain ?? [];
        return [...products];
    }, [routeQuery.data?.chain]);
    const sourceProducts = useMemo(
        () =>
            (myProductsQuery.data ?? []).filter((product) => product.status === 'active'),
        [myProductsQuery.data],
    );

    const selectSource = useCallback(
        (productId: string) => {
            const params = new URLSearchParams(searchParams);
            params.set('from', productId);
            navigate(`/route?${params.toString()}`);
        },
        [navigate, searchParams],
    );

    const productIds = useMemo(
        () => [
            targetId,
            sourceId,
            ...chain.map((product) => product.product_id),
            ...(myChainsQuery.data ?? []).flatMap((item) => [
                item.from_product_id,
                item.to_product_id,
                item.exchange_goal_id,
                item.route_step_id,
            ]),
        ],
        [chain, myChainsQuery.data, sourceId, targetId],
    );
    const availableProducts = useMemo(
        () => [...(productsQuery.data ?? []), ...(myProductsQuery.data ?? []), ...chain],
        [chain, myProductsQuery.data, productsQuery.data],
    );
    const productsById = useProductsById(productIds, availableProducts);

    const routeSource = chain[0];
    const requestedSource = sourceId ? productsById.get(sourceId) : undefined;
    /* Сюда приходят сразу после создания вещи, и её карточка в этот момент
       ещё догружается. Пока запрос в пути, экран должен ждать, а не заявлять,
       что исходный товар определить не удалось: до перезагрузки страницы
       пользователь видел бы пустой маршрут вместо своего нового объявления. */
    const isSourceResolving =
        Boolean(sourceId) &&
        !requestedSource &&
        (myProductsQuery.isFetching || productsQuery.isFetching);
    const selectedSource =
        requestedSource &&
        requestedSource.customer_id === currentCustomerId &&
        requestedSource.status === 'active'
            ? requestedSource
            : undefined;
    const goalProduct = targetCategoryId ? undefined : productsById.get(targetId) ?? chain[chain.length - 1];
    const targetCategoryName = targetCategoryId
        ? categoriesQuery.data?.find((category) => category.category_id === targetCategoryId)?.name
        : undefined;
    const goalId = targetCategoryId || goalProduct?.product_id || targetId;
    const categoryTargetProduct = targetCategoryId
        ? (productsQuery.data ?? []).find(
              (product) =>
                  product.category_id === targetCategoryId &&
                  product.status === 'active' &&
                  product.product_id !== sourceId,
          )
        : undefined;
    const lastCompletedRouteStep = useMemo(() => {
        return [...(myChainsQuery.data ?? [])]
            .filter(
                (item) =>
                    item.status === 'completed' &&
                    item.initiator_id === currentCustomerId &&
                    item.route_step_id &&
                    item.route_step_id !== sourceId &&
                    (targetCategoryId
                        ? item.to_category_id === targetCategoryId
                        : item.exchange_goal_id === goalId ||
                          (!item.exchange_goal_id && item.to_product_id === goalId)),
            )
            .sort((left, right) => right.updated_at.localeCompare(left.updated_at))[0];
    }, [currentCustomerId, goalId, myChainsQuery.data, sourceId, targetCategoryId]);
    const completedStepProduct = lastCompletedRouteStep
        ? lastCompletedRouteStep.to_product_id
            ? productsById.get(lastCompletedRouteStep.to_product_id)
            : undefined
        : undefined;
    const currentProduct = completedStepProduct ?? selectedSource ?? routeSource;
    /* Кандидаты следующего шага считает бэкенд (сперва совпадения по
       вишлисту, затем остальной каталог) — фронт больше не перебирает 100
       товаров руками, подбирая совпадение по категории. */
    const candidatesQuery = useFindCandidatesQuery(
        { product_id: currentProduct?.product_id ?? '' },
        { skip: !currentProduct?.product_id, refetchOnMountOrArgChange: true },
    );
    const currentProductIndex = chain.findIndex(
        (product) => product.product_id === currentProduct?.product_id,
    );
    const firstHop = targetCategoryId
        ? categoryTargetProduct
        :
        currentProductIndex >= 0
            ? chain[currentProductIndex + 1] ?? goalProduct
            : routeSource?.customer_id === currentCustomerId
              ? chain[1] ?? goalProduct
              : routeSource ?? goalProduct;
    const hasReachedGoal = currentProduct?.product_id === goalId && currentProductIndex > 0;
    const stepsRemaining = hasReachedGoal
        ? 0
        : currentProductIndex >= 0
          ? Math.max(1, chain.length - currentProductIndex - 1)
          : 1;

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
                    (targetCategoryId
                        ? offer.to_category_id === targetCategoryId
                        : offer.exchange_goal_id === goalId ||
                          (!offer.exchange_goal_id && offer.to_product_id === goalId)) &&
                    OPEN_OFFER_STATUSES.has(offer.status),
            )
            .sort((left, right) => right.updated_at.localeCompare(left.updated_at));
    }, [currentCustomerId, currentProduct, goalId, myChainsQuery.data, targetCategoryId]);

    const offerByTargetId = useMemo(() => {
        const map = new Map<string, TChain>();
        for (const offer of stageOffers) {
            if (offer.to_product_id && !map.has(offer.to_product_id)) {
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
        /* Кандидат из найденного маршрута — не догадка по категории, а
           подтверждённый шаг до цели: на карточке это стоит показать явно. */
        const bestMatchId = firstHop.product_id;

        /* Первый шаг маршрута попадает в список, только если по нему вообще
           можно предложить обмен: ушедшую или свою вещь выбрать нельзя, и
           сервер отклонит такое предложение уже после отправки. */
        if (firstHop.status === 'active' && firstHop.customer_id !== currentCustomerId) {
            candidates.set(firstHop.product_id, firstHop);
        }

        for (const offer of stageOffers) {
            const product = offer.to_product_id ? productsById.get(offer.to_product_id) : undefined;
            if (product) {
                candidates.set(product.product_id, product);
            }
        }

        for (const product of candidatesQuery.data?.products ?? []) {
            if (product.product_id === currentProduct.product_id) {
                continue;
            }

            candidates.set(product.product_id, product);

            if (candidates.size >= 8) {
                break;
            }
        }

        return [...candidates.values()].map((product) => ({
            product,
            offer: offerByTargetId.get(product.product_id),
            isBestMatch: product.product_id === bestMatchId,
        }));
    }, [
        candidatesQuery.data,
        currentCustomerId,
        currentProduct,
        firstHop,
        offerByTargetId,
        productsById,
        stageOffers,
    ]);

    const history = useMemo<TRouteHistoryItem[]>(() => {
        return (myChainsQuery.data ?? [])
            .filter(
                (item) =>
                    item.status === 'completed' &&
                    item.initiator_id === currentCustomerId &&
                    (targetCategoryId
                        ? item.to_category_id === targetCategoryId
                        : item.exchange_goal_id === goalId ||
                          (!item.exchange_goal_id && item.to_product_id === goalId)),
            )
            .sort((left, right) => right.updated_at.localeCompare(left.updated_at))
            .map((item) => ({
                chain: item,
                product: productsById.get(item.from_product_id),
            }));
    }, [currentCustomerId, goalId, myChainsQuery.data, productsById, targetCategoryId]);

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
                createChain(
                    buildChainPayload({
                        fromProductId: currentProduct.product_id,
                        toProductId: productId,
                        message: `Предложение в рамках цели «${goalProduct?.title ?? 'Обмен до цели'}»`,
                        routeContext: {
                            ...(targetCategoryId
                                ? {goalCategoryId: targetCategoryId}
                                : {exchangeGoalId: goalId}),
                            routeStepId: currentProduct.product_id,
                            previousChainId: lastCompletedRouteStep?.chain_id,
                        },
                    }),
                ).unwrap(),
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
    }, [
        createChain,
        currentProduct,
        goalId,
        goalProduct?.title,
        lastCompletedRouteStep?.chain_id,
        myChainsQuery,
        selectedTargetIds,
        targetCategoryId,
    ]);

    const openProduct = useCallback(
        (productId: string) => navigate(`/product/${productId}`),
        [navigate],
    );
    const openOffer = useCallback(
        (chainId: string) => navigate(`/exchanges/${chainId}`),
        [navigate],
    );
    /* Предложение к цели уходит в адрес вместе с контекстом маршрута: иначе
       после перезагрузки окна цепочка потеряла бы привязку к цели. */
    const openGoalOffer = useCallback(() => {
        if (!goalId) {
            return;
        }

        openModalRoute({
            name: 'offerExchange',
            productId: goalId,
            ...(targetCategoryId ? { goalCategoryId: targetCategoryId } : { exchangeGoalId: goalId }),
            routeStepId: currentProduct?.product_id,
            previousChainId: lastCompletedRouteStep?.chain_id,
            goalTitle: goalProduct?.title ?? targetCategoryName,
        });
    }, [
        currentProduct?.product_id,
        goalId,
        goalProduct?.title,
        lastCompletedRouteStep?.chain_id,
        openModalRoute,
        targetCategoryId,
        targetCategoryName,
    ]);
    const goHome = useCallback(() => navigate('/'), [navigate]);

    const isLoading =
        routeQuery.isLoading ||
        productsQuery.isLoading ||
        myProductsQuery.isLoading ||
        myChainsQuery.isLoading ||
        candidatesQuery.isLoading ||
        isSourceResolving;
    const isError =
        routeQuery.isError ||
        productsQuery.isError ||
        myProductsQuery.isError ||
        myChainsQuery.isError ||
        candidatesQuery.isError;
    const isEmpty = !isLoading && !isError && (!currentProduct || (!targetCategoryId && !goalProduct));

    return {
        targetId: targetId || targetCategoryId,
        sourceId,
        targetCategoryName,
        isLoading,
        isError,
        isEmpty,
        currentCustomerId,
        sourceProducts,
        selectSource,
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
        toggleRecommendation,
        submitSelectedOffers,
        openProduct,
        openOffer,
        openGoalOffer,
        goHome,
    };
};
