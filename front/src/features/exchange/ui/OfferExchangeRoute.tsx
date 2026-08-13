import { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import type { TRouteContext } from '@entities/chain';
import { useGetCurrentUserQuery } from '@entities/user';
import { useCloseModalRoute } from '@shared/lib';

import { OfferExchangeModal } from './OfferExchangeModal';

/**
 * Модальное окно предложения обмена как маршрут `/product/:productId/offer`.
 *
 * Товар и контекст маршрута берутся из адреса, а не из состояния экрана,
 * поэтому одно и то же окно открывается из каталога, карточки товара и
 * «Пути к цели», переживает перезагрузку и делится ссылкой.
 */
export const OfferExchangeRoute = () => {
    const { productId = '' } = useParams<{ productId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    /* Без фоновой страницы (прямой заход по ссылке) закрытие ведёт на сам
       товар: каталог увёл бы пользователя от вещи, ради которой он пришёл. */
    const closeModal = useCloseModalRoute(productId ? `/product/${productId}` : '/');
    const { data: currentUser } = useGetCurrentUserQuery();

    const exchangeGoalId = searchParams.get('goal') ?? undefined;
    const goalCategoryId = searchParams.get('goalCategory') ?? undefined;
    const routeStepId = searchParams.get('step') ?? undefined;
    const previousChainId = searchParams.get('prevChain') ?? undefined;
    const goalTitle = searchParams.get('goalTitle') ?? undefined;

    /* Контекст маршрута считается заданным только вместе с целью: без неё
       бэкенд всё равно создаст самостоятельную цепочку, а форма зря спрячет
       выбор привязки. */
    const routeContext = useMemo<TRouteContext | undefined>(() => {
        if (!exchangeGoalId && !goalCategoryId) {
            return undefined;
        }

        return {
            ...(goalCategoryId ? { goalCategoryId } : { exchangeGoalId }),
            routeStepId,
            previousChainId,
            goalTitle,
        };
    }, [exchangeGoalId, goalCategoryId, goalTitle, previousChainId, routeStepId]);

    return (
        <OfferExchangeModal
            isOpen
            onClose={closeModal}
            onSuccess={(chainId) =>
                navigate(chainId ? `/exchanges/${chainId}` : '/exchanges', { replace: true })
            }
            targetProductId={productId}
            currentCustomerId={currentUser?.customer_id}
            routeContext={routeContext}
            /* Внутри маршрута к цели полная форма недоступна: уход на неё
               потерял бы цепочку, к которой привязано предложение. */
            onCreateFullProduct={
                routeContext
                    ? undefined
                    : () => navigate(`/create?target=${encodeURIComponent(productId)}`)
            }
        />
    );
};
