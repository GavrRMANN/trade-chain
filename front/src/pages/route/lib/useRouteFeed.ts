import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGetCategoriesQuery } from '@entities/category';
import { useCreateChainMutation } from '@entities/chain';
import type { TChain } from '@entities/chain';
import type { TFeedOfferAction } from '@widgets/productFeed';

import { useRoute } from './useRoute';

/**
 * Отправка предложения из ленты: одно за раз и всегда про конкретную вещь.
 *
 * Все три исхода описаны одним состоянием вместе с товаром, к которому они
 * относятся: иначе «отправляем» и «ошибка» могли бы разойтись по разным
 * карточкам и подписаться сразу под двумя.
 */
type TFeedOfferState =
    | { status: 'idle' }
    | { status: 'sending'; productId: string }
    | { status: 'sent'; productId: string }
    | { status: 'error'; productId: string; message: string };

/** Предложение уже отправлено и ещё живо — повторять его нельзя. */
const isOpenOffer = (offer?: TChain) => offer?.status === 'pending';

/**
 * Подборка следующего шага маршрута, открытая лентой.
 *
 * Данные считает {@link useRoute} — тот же этап, та же цель, тот же список
 * вариантов, что и в блоке на странице маршрута. Лента добавляет к ним лишь
 * своё действие: предложение уходит сразу, без формы выбора отдаваемой вещи,
 * потому что внутри маршрута она уже определена текущим этапом.
 */
export const useRouteFeed = () => {
    const route = useRoute();
    const navigate = useNavigate();
    const [createChain] = useCreateChainMutation();
    const [offerState, setOfferState] = useState<TFeedOfferState>({ status: 'idle' });

    const { data: categories = [] } = useGetCategoriesQuery();
    const categoryNames = useMemo(
        () => new Map(categories.map(({ category_id, name }) => [category_id, name])),
        [categories],
    );

    const { buildOfferPayload, currentProduct, recommendations } = route;

    const products = useMemo(
        () => recommendations.map(({ product }) => product),
        [recommendations],
    );
    const offersByProductId = useMemo(
        () =>
            new Map(
                recommendations
                    .filter(({ offer }) => offer)
                    .map(({ product, offer }) => [product.product_id, offer as TChain]),
            ),
        [recommendations],
    );

    /* Подпись главной кнопки — это и есть состояние варианта: предложить,
       отправляется, уже отправлено или можно перейти в начатый обмен.
       Отдельных флагов на карточку нет, всё выводится из цепочек и из
       текущей отправки. */
    const offerActions = useMemo(() => {
        const giveaway = currentProduct?.title;

        return new Map<string, TFeedOfferAction>(
            recommendations.map(({ product }) => {
                const offer = offersByProductId.get(product.product_id);
                const isCurrent =
                    offerState.status !== 'idle' && offerState.productId === product.product_id;

                if (offer?.status === 'active') {
                    return [
                        product.product_id,
                        {
                            label: 'Открыть обмен',
                            shortLabel: 'Обмен',
                            ariaLabel: `Открыть обмен по «${product.title}»`,
                            hint: 'Предложение принято — продолжите в сделке',
                        },
                    ];
                }

                if (isOpenOffer(offer) || (isCurrent && offerState.status === 'sent')) {
                    return [
                        product.product_id,
                        {
                            label: 'Предложение отправлено',
                            shortLabel: 'Отправлено',
                            ariaLabel: `Предложение по «${product.title}» уже отправлено`,
                            hint: 'Ответ появится на странице маршрута и в обменах',
                            disabled: true,
                        },
                    ];
                }

                if (isCurrent && offerState.status === 'sending') {
                    return [
                        product.product_id,
                        {
                            label: 'Отправляем…',
                            shortLabel: 'Отправка',
                            ariaLabel: `Отправляем предложение по «${product.title}»`,
                            disabled: true,
                        },
                    ];
                }

                if (isCurrent && offerState.status === 'error') {
                    return [
                        product.product_id,
                        {
                            label: 'Повторить предложение',
                            shortLabel: 'Повторить',
                            ariaLabel: `Повторить предложение по «${product.title}»`,
                            hint: offerState.message,
                        },
                    ];
                }

                return [
                    product.product_id,
                    {
                        label: 'Предложить обмен',
                        shortLabel: 'Предложить',
                        ariaLabel: `Предложить «${giveaway ?? 'свою вещь'}» в обмен на «${product.title}»`,
                        hint: giveaway
                            ? `Отдаёте «${giveaway}» — предложение уйдёт в эту цепочку`
                            : undefined,
                    },
                ];
            }),
        );
    }, [currentProduct?.title, offersByProductId, offerState, recommendations]);

    /* Форма выбора отдаваемой вещи здесь не открывается: в подборке маршрута
       она уже выбрана этапом, а привязка к цели и предыдущему шагу приходит
       из того же места, что и на странице маршрута. */
    const offerExchange = useCallback(
        async (productId: string) => {
            const offer = offersByProductId.get(productId);

            if (offer?.status === 'active') {
                navigate(`/exchanges/${offer.chain_id}`);
                return;
            }

            const payload = isOpenOffer(offer) ? undefined : buildOfferPayload(productId);
            if (!payload) {
                return;
            }

            setOfferState({ status: 'sending', productId });

            try {
                await createChain(payload).unwrap();
                setOfferState({ status: 'sent', productId });
            } catch {
                setOfferState({
                    status: 'error',
                    productId,
                    message: 'Не удалось отправить предложение. Попробуйте ещё раз.',
                });
            }
        },
        [buildOfferPayload, createChain, navigate, offersByProductId],
    );

    const openOwner = useCallback(
        (customerId: string) => navigate(`/profile/${customerId}`),
        [navigate],
    );

    return { ...route, products, categoryNames, offerActions, offerExchange, openOwner };
};
