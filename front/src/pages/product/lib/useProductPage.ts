import { useCallback, useReducer } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useOpenModalRoute } from '@shared/lib';

import { useProductPageData } from './useProductPageData';
import { useProductActions } from './useProductActions';

const statusLabels = {
    active: 'Активен',
    reserved: 'Зарезервирован',
    exchanged: 'Обменян',
    archived: 'В архиве',
} as const;

type TOfferState = { isOpen: boolean };
type TOfferAction = { type: 'open' } | { type: 'close' };

const offerReducer = (state: TOfferState, action: TOfferAction): TOfferState => ({
    isOpen: action.type === 'open',
});

export const useProductPage = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const openModalRoute = useOpenModalRoute();
    const [offerState, dispatchOffer] = useReducer(offerReducer, { isOpen: false });

    const {
        product,
        customer,
        category,
        wishlist,
        wishlistOptions,
        matchingProducts,
        hasOwnActiveProducts,
        isOwnProductsKnown,
        routeChain,
        reviews,
        averageRating,
        incomingOffers,
        productOffers,
        myProductOffers,
        targetChain,
        isOwner,
        isAuthenticated,
        currentUserId,
        isLoading,
        isError,
    } = useProductPageData(productId);

    const {
        status: actionStatus,
        requestArchive,
        cancelConfirm,
        confirm,
        confirmAction,
        confirmText,
        confirmLabel,
        isLoading: isActionLoading,
        error: actionError,
    } = useProductActions(product?.product_id);

    const status: keyof typeof statusLabels = actionStatus ?? product?.status ?? 'active';
    const sellerName = customer?.email || 'Email не указан';
    const hasRating = typeof averageRating === 'number' && averageRating > 0;
    const ratingText = hasRating
        ? `${averageRating.toFixed(1)} · Отзывов: ${reviews.length}`
        : reviews.length
          ? `Отзывов: ${reviews.length}`
          : 'Пока без отзывов';
    const canOffer = status === 'active' && !isOwner && isAuthenticated;
    // Пока список своих товаров не загружен, считаем, что они есть —
    // чтобы не мигать кнопкой «Добавить объявление» до ответа сервера.
    const needsOwnProductToOffer =
        canOffer && isOwnProductsKnown && !hasOwnActiveProducts;

    const openOffer = useCallback(() => {
        if (!isAuthenticated) {
            openModalRoute('auth');
            return;
        }
        if (status === 'active') dispatchOffer({ type: 'open' });
    }, [isAuthenticated, status, openModalRoute]);

    const closeOffer = useCallback(() => dispatchOffer({ type: 'close' }), []);

    const onOfferSuccess = useCallback(
        (chainId: string) => navigate(`/exchanges/${chainId}`),
        [navigate],
    );

    const openProduct = useCallback((id: string) => navigate(`/product/${id}`), [navigate]);

    const openEditProduct = useCallback(
        (id: string) => navigate(`/product/${id}/edit`),
        [navigate],
    );

    const openExchanges = useCallback(() => navigate('/exchanges'), [navigate]);

    const openCreate = useCallback(() => navigate('/create'), [navigate]);

    const openRoute = useCallback(
        (productId: string, sourceProductId?: string) => {
            const params = new URLSearchParams({ target: productId });
            if (sourceProductId) {
                params.set('from', sourceProductId);
            }
            navigate(`/route?${params.toString()}`);
        },
        [navigate],
    );

    const openExchangeRoom = useCallback(
        (chainId: string) => navigate(`/exchanges/${chainId}`),
        [navigate],
    );

    return {
        // данные
        product,
        customer,
        category,
        wishlist,
        wishlistOptions,
        matchingProducts,
        routeChain,
        reviews,
        averageRating,
        incomingOffers,
        productOffers,
        myProductOffers,
        targetChain,
        isOwner,
        isAuthenticated,
        currentUserId,
        isLoading,
        isError,
        // статус
        status,
        statusLabels,
        sellerName,
        hasRating,
        ratingText,
        canOffer,
        needsOwnProductToOffer,
        // offer-модалка
        isOfferOpen: offerState.isOpen,
        openOffer,
        closeOffer,
        onOfferSuccess,
        // действия
        requestArchive,
        cancelConfirm,
        confirm,
        confirmAction,
        confirmText,
        confirmLabel,
        isActionLoading,
        actionError,
        // навигация
        openProduct,
        openEditProduct,
        openExchanges,
        openCreate,
        openRoute,
        openExchangeRoom,
    };
};
