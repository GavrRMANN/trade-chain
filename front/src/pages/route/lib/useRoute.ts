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

import { orderChainForRoute } from './orderChain';

const OPEN_OFFER_STATUSES = new Set<TChain['status']>(['pending', 'active']);

/**
 * Сколько вариантов показывать прямо на странице маршрута.
 *
 * Блок отвечает на вопрос «что дальше», а не заменяет собой каталог: длинный
 * ряд карточек отодвигал вниз и текущую вещь, и историю пути. Карточки в ряду
 * узкие, поэтому пятёрка занимает столько же высоты, сколько раньше тройка, а
 * сравнивать есть из чего. Остальное открывается лентой из плитки в конце ряда.
 */
const RECOMMENDATIONS_PREVIEW_LIMIT = 5;

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

    /** Маршрут в порядке прохождения: своя вещь первой, цель последней. */
    const chain = useMemo(
        () => orderChainForRoute(routeQuery.data?.chain ?? [], { sourceId, targetId }),
        [routeQuery.data?.chain, sourceId, targetId],
    );
    /** Вещи найденного пути: до них маршрут до цели подтверждён поиском. */
    const chainProductIds = useMemo(
        () => new Set(chain.map((product) => product.product_id)),
        [chain],
    );
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
    /* Кандидаты следующего шага считает бэкенд — фронт больше не перебирает
       100 товаров руками, подбирая совпадение по категории. direct оставляет
       только вещи с прямым обменом: остальной каталог сервер добирал «чтобы
       было», и в ряду следующего шага рядом с подтверждённым вариантом
       стояли товары, обмен с которыми к цели не ведёт. */
    const candidatesQuery = useFindCandidatesQuery(
        { product_id: currentProduct?.product_id ?? '', direct: true },
        { skip: !currentProduct?.product_id, refetchOnMountOrArgChange: true },
    );
    const currentProductIndex = chain.findIndex(
        (product) => product.product_id === currentProduct?.product_id,
    );
    /* Следующий шаг найденного маршрута — сосед текущей вещи в цепочке.
       Подставлять сюда цель, когда пути нет, нельзя: прямой обмен с ней
       предлагается отдельной кнопкой, а в подборке это была бы догадка,
       выданная за подтверждённый шаг. */
    const nextChainStep = currentProductIndex >= 0 ? chain[currentProductIndex + 1] : undefined;
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
        if (!currentProduct) {
            return [];
        }

        const candidates = new Map<string, TProduct>();

        /* Шаг маршрута попадает в список, только если по нему вообще можно
           предложить обмен: ушедшую или свою вещь выбрать нельзя, и сервер
           отклонит такое предложение уже после отправки. Ставим его первым и
           отдельно от подборки: сервер сортирует кандидатов по близости вещей
           и мог бы не довезти подтверждённый шаг до конца списка. */
        if (
            nextChainStep &&
            nextChainStep.status === 'active' &&
            nextChainStep.customer_id !== currentCustomerId
        ) {
            candidates.set(nextChainStep.product_id, nextChainStep);
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

        /* Лучший вариант — вещь из найденной цепочки: путь до цели через неё
           уже посчитан поиском, остальное подобрано лишь по прямому обмену с
           текущей вещью. */
        return [...candidates.values()].map((product) => ({
            product,
            offer: offerByTargetId.get(product.product_id),
            isBestMatch:
                product.product_id !== currentProduct.product_id &&
                chainProductIds.has(product.product_id),
        }));
    }, [
        candidatesQuery.data,
        chainProductIds,
        currentCustomerId,
        currentProduct,
        nextChainStep,
        offerByTargetId,
        productsById,
        stageOffers,
    ]);

    /* На странице маршрута блок показывает только начало подборки: остальное
       листается лентой, где карточка занимает экран целиком. */
    const previewRecommendations = useMemo(
        () => recommendations.slice(0, RECOMMENDATIONS_PREVIEW_LIMIT),
        [recommendations],
    );

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

    /* Привязка предложения к маршруту собирается в одном месте: и блок на
       странице, и лента подборки должны отправлять цепочку с той же целью,
       текущим этапом и предыдущим шагом — иначе предложение из ленты
       оказалось бы самостоятельным обменом мимо пути к цели. */
    const buildOfferPayload = useCallback(
        (toProductId: string) => {
            if (!currentProduct) {
                return undefined;
            }

            return buildChainPayload({
                fromProductId: currentProduct.product_id,
                toProductId,
                message: `Предложение в рамках цели «${goalProduct?.title ?? 'Обмен до цели'}»`,
                routeContext: {
                    ...(targetCategoryId
                        ? { goalCategoryId: targetCategoryId }
                        : { exchangeGoalId: goalId }),
                    routeStepId: currentProduct.product_id,
                    previousChainId: lastCompletedRouteStep?.chain_id,
                },
            });
        },
        [currentProduct, goalId, goalProduct?.title, lastCompletedRouteStep?.chain_id, targetCategoryId],
    );

    const submitSelectedOffers = useCallback(async () => {
        if (!currentProduct || selectedTargetIds.length === 0) {
            return;
        }

        setSubmitError(undefined);
        setSubmitMessage(undefined);

        const results = await Promise.allSettled(
            selectedTargetIds.map((productId) => {
                const payload = buildOfferPayload(productId);

                return payload
                    ? createChain(payload).unwrap()
                    : Promise.reject(new Error('Текущий товар маршрута не определён'));
            }),
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
    }, [buildOfferPayload, createChain, currentProduct, myChainsQuery, selectedTargetIds]);

    const openProduct = useCallback(
        (productId: string) => navigate(`/product/${productId}`),
        [navigate],
    );
    /* Лента подборки открывается тем же адресом маршрута: цель, категория и
       стартовый товар остаются в query, поэтому обе страницы считают один и
       тот же этап и переживают перезагрузку и возврат назад. */
    const openRecommendationsFeed = useCallback(
        () => navigate(`/route/feed?${searchParams.toString()}`),
        [navigate, searchParams],
    );
    const backToRoute = useCallback(
        () => navigate(`/route?${searchParams.toString()}`),
        [navigate, searchParams],
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

    /**
     * Маршрут открыт тем, кому он принадлежит.
     *
     * Подборка следующего шага считается от вещи, которая сейчас на руках у
     * пользователя, — это персональная выдача, а не публичная страница.
     * Адрес маршрута можно переслать, поэтому одной защиты роутом мало:
     * этап обязан быть подтверждён данными самого пользователя — либо его
     * активным стартовым товаром, либо его же завершённым шагом к этой цели.
     * Чужой аккаунт по такой ссылке не получит ни того, ни другого.
     */
    const isOwnRoute = Boolean(selectedSource ?? completedStepProduct);

    const isLoading =
        currentUserQuery.isLoading ||
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
        isOwnRoute,
        currentCustomerId,
        sourceProducts,
        selectSource,
        currentProduct,
        goalProduct,
        goalId,
        stepsRemaining,
        recommendations,
        previewRecommendations,
        selectedTargetIds,
        history,
        submitError,
        submitMessage,
        isSubmitting,
        buildOfferPayload,
        toggleRecommendation,
        submitSelectedOffers,
        openProduct,
        openOffer,
        openGoalOffer,
        openRecommendationsFeed,
        backToRoute,
        goHome,
    };
};
