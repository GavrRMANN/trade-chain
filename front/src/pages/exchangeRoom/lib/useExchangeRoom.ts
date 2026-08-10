import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
    useConfirmChainMutation,
    useGetChainDetailsQuery,
    useGetChainMessagesQuery,
    useGetChainQuery,
    useSendChainMessageMutation,
    useUpdateChainStatusMutation,
} from '@entities/chain';
import type { TUpdateChainStatus } from '@entities/chain';
import { useGetProductsQuery } from '@entities/product';
import type { TProduct } from '@entities/product';
import { useCreateReviewMutation } from '@entities/review';
import { useGetCurrentUserQuery } from '@entities/user';
import { usePageTitle } from '@app/providers/pageTitle';

const getErrorMessage = (error: unknown) => {
    if (typeof error === 'object' && error !== null && 'data' in error) {
        const data = error.data;
        if (
            typeof data === 'object' &&
            data !== null &&
            'error' in data &&
            typeof data.error === 'string'
        ) {
            return data.error;
        }
    }
    return 'Не удалось выполнить действие. Попробуйте ещё раз.';
};

export const useExchangeRoom = () => {
    const { chainId } = useParams<{ chainId: string }>();
    const navigate = useNavigate();
    const { setTitle } = usePageTitle();

    useLayoutEffect(() => {
        setTitle('Сделка обмена');
    }, [setTitle]);

    const chainQuery = useGetChainQuery(chainId ?? '', { skip: !chainId });
    const chainDetailsQuery = useGetChainDetailsQuery(chainId ?? '', { skip: !chainId });
    const messagesQuery = useGetChainMessagesQuery(chainId ?? '', { skip: !chainId });
    const productsQuery = useGetProductsQuery();
    const currentUserQuery = useGetCurrentUserQuery();

    const [updateChainStatus, { isLoading: isStatusUpdating }] = useUpdateChainStatusMutation();
    const [confirmChain, { isLoading: isConfirming }] = useConfirmChainMutation();
    const [sendChainMessage, { isLoading: isMessageSending }] = useSendChainMessageMutation();
    const [createReview, { isLoading: isReviewCreating }] = useCreateReviewMutation();

    const [messageDraft, setMessageDraft] = useState('');
    const [statusError, setStatusError] = useState<string>();
    const [messageError, setMessageError] = useState<string>();
    const [reviewError, setReviewError] = useState<string>();
    const [isReviewSent, setIsReviewSent] = useState(false);

    // Форма отзыва
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const chain = chainQuery.data;
    const currentUserId = currentUserQuery.data?.customer_id;
    const isInitiator = Boolean(chain && currentUserId && chain.initiator_id === currentUserId);

    const isPendingLike = chain?.status === 'pending' || chain?.status === 'countered';
    const isActive = chain?.status === 'active';
    const isCompleted = chain?.status === 'completed';
    const hasConfirmedSuccessfulOutcome = Boolean(
        currentUserId &&
            chainDetailsQuery.data?.confirmations.some(
                (confirmation) =>
                    confirmation.customer_id === currentUserId &&
                    confirmation.result === 'success',
            ),
    );
    const isWaitingForOtherConfirmation = isActive && hasConfirmedSuccessfulOutcome;

    // Резолвим оба товара цепочки из общего списка продуктов клиентской картой.
    const productsById = useMemo(() => {
        const map = new Map<string, TProduct>();
        (productsQuery.data ?? []).forEach((product) => {
            map.set(product.product_id, product);
        });
        return map;
    }, [productsQuery.data]);

    const fromProduct = chain ? productsById.get(chain.from_product_id) : undefined;
    const toProduct = chain && chain.to_product_id
        ? productsById.get(chain.to_product_id)
        : undefined;

    const handleChangeStatus = useCallback(
        async (status: TUpdateChainStatus) => {
            if (!chainId) return;
            setStatusError(undefined);
            try {
                await updateChainStatus({ id: chainId, body: { status } }).unwrap();
                chainQuery.refetch();
            } catch (error) {
                setStatusError(getErrorMessage(error));
            }
        },
        [chainId, updateChainStatus, chainQuery],
    );

    const handleConfirm = useCallback(
        async (success: boolean) => {
            if (!chainId) return;
            setStatusError(undefined);
            try {
                await confirmChain({ id: chainId, body: { success } }).unwrap();
                chainQuery.refetch();
                chainDetailsQuery.refetch();
            } catch (error) {
                setStatusError(getErrorMessage(error));
            }
        },
        [chainId, confirmChain, chainQuery, chainDetailsQuery],
    );

    const handleSendMessage = useCallback(async () => {
        if (!chainId) return;
        const body = messageDraft.trim();
        if (!body) return;
        setMessageError(undefined);
        try {
            await sendChainMessage({ id: chainId, body: { body } }).unwrap();
            setMessageDraft('');
            messagesQuery.refetch();
        } catch (error) {
            setMessageError(getErrorMessage(error));
        }
    }, [chainId, messageDraft, sendChainMessage, messagesQuery]);

    const handleSendReview = useCallback(async () => {
        if (!chainId || rating < 1) return;
        setReviewError(undefined);
        try {
            await createReview({
                chain_id: chainId,
                rating,
                comment: comment.trim() || undefined,
            }).unwrap();
            setIsReviewSent(true);
        } catch (error) {
            setReviewError(getErrorMessage(error));
        }
    }, [chainId, rating, comment, createReview]);

    const openProduct = useCallback(
        (productId: string) => navigate(`/product/${productId}`),
        [navigate],
    );

    const isActionLoading = isStatusUpdating || isConfirming;

    return {
        chain,
        currentUserId,
        isInitiator,
        fromProduct,
        toProduct,
        messages: messagesQuery.data ?? [],
        isLoading: chainQuery.isLoading || productsQuery.isLoading,
        isError: chainQuery.isError,
        // статусы
        isPendingLike,
        isActive,
        isCompleted,
        isWaitingForOtherConfirmation,
        // навигация
        openProduct,
        // чат
        messageDraft,
        setMessageDraft,
        handleSendMessage,
        isMessageSending,
        messageError,
        // действия по статусу
        handleChangeStatus,
        handleConfirm,
        isActionLoading,
        statusError,
        // отзыв
        rating,
        setRating,
        comment,
        setComment,
        handleSendReview,
        isReviewCreating,
        reviewError,
        isReviewSent,
    };
};
