import { useCallback, useLayoutEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { usePageTitle } from '@app/providers/pageTitle';
import { useOpenModalRoute } from '@shared/lib';

import { useProductPageData } from './useProductPageData';
import { useProductActions } from './useProductActions';

const statusLabels = {
    active: 'Активен',
    reserved: 'Зарезервирован',
    exchanged: 'Обменян',
    archived: 'В архиве',
} as const;

export const useProductPage = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const openModalRoute = useOpenModalRoute();
    const { setTitle } = usePageTitle();
    const [isOfferOpen, setIsOfferOpen] = useState(false);

    const {
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

    useLayoutEffect(() => {
        setTitle('');
    }, [setTitle]);

    const status: keyof typeof statusLabels = actionStatus ?? product?.status ?? 'active';
    const sellerName = customer?.email || 'Email не указан';
    const hasRating = typeof averageRating === 'number' && averageRating > 0;
    const ratingText = hasRating
        ? `${averageRating.toFixed(1)} · Отзывов: ${reviews.length}`
        : reviews.length
            ? `Отзывов: ${reviews.length}`
            : 'Пока без отзывов';
    const canOffer = status === 'active' && !isOwner && isAuthenticated;

    const openOffer = useCallback(() => {
        if (!isAuthenticated) {
            openModalRoute('auth');
            return;
        }
        if (status === 'active') setIsOfferOpen(true);
    }, [isAuthenticated, status, openModalRoute]);

    const closeOffer = useCallback(() => setIsOfferOpen(false), []);

    const onOfferSuccess = useCallback(
        (chainId: string) => navigate(`/exchanges/${chainId}`),
        [navigate],
    );

    const openProduct = useCallback(
        (id: string) => navigate(`/product/${id}`),
        [navigate],
    );

    const openEditProduct = useCallback(
        (id: string) => navigate(`/product/${id}/edit`),
        [navigate],
    );

    const openExchanges = useCallback(() => navigate('/exchanges'), [navigate]);

    const openCreate = useCallback(() => navigate('/create'), [navigate]);

    const openRoute = useCallback(
        (productId: string) => navigate(`/route?target=${productId}`),
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
        // offer-модалка
        isOfferOpen,
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
