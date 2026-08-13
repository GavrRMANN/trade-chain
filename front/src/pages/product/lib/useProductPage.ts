import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getDisplayName, useOpenModalRoute } from '@shared/lib';

import { useProductPageData } from './useProductPageData';

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

    const status: keyof typeof statusLabels = product?.status ?? 'active';
    const sellerName = getDisplayName(customer?.full_name, customer?.email) || 'Email не указан';
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
            openModalRoute({ name: 'auth' });
            return;
        }
        if (status === 'active' && productId) {
            openModalRoute({ name: 'offerExchange', productId });
        }
    }, [isAuthenticated, openModalRoute, productId, status]);

    const requestArchive = useCallback(() => {
        if (productId) {
            openModalRoute({ name: 'archiveProduct', productId });
        }
    }, [openModalRoute, productId]);

    const openProduct = useCallback((id: string) => navigate(`/product/${id}`), [navigate]);

    const openEditProduct = useCallback(
        (id: string) => navigate(`/product/${id}/edit`),
        [navigate],
    );

    const openExchanges = useCallback(() => navigate('/exchanges'), [navigate]);

    const openIncomingOffers = useCallback(() => {
        if (!product) {
            navigate('/exchanges?view=exchanges&tab=incoming');
            return;
        }
        navigate(
            `/exchanges?view=exchanges&tab=incoming&product=${encodeURIComponent(product.product_id)}`,
        );
    }, [navigate, product]);

    const openCreate = useCallback(() => navigate('/create'), [navigate]);

    /**
     * Полная форма из контекста чужого товара: цель передаётся в адрес,
     * иначе пользователь вернётся с новой вещью, но без товара, ради
     * которого начал сценарий.
     */
    const openCreateForTarget = useCallback(() => {
        if (!product) {
            navigate('/create');
            return;
        }

        navigate(`/create?target=${encodeURIComponent(product.product_id)}`);
    }, [navigate, product]);

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
        // модальные маршруты
        openOffer,
        requestArchive,
        // навигация
        openProduct,
        openEditProduct,
        openExchanges,
        openIncomingOffers,
        openCreate,
        openCreateForTarget,
        openRoute,
        openExchangeRoom,
    };
};
