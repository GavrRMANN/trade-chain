import { useCallback, useLayoutEffect, useMemo, useReducer } from 'react';
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
import { useGetProductQuery, useGetProductsQuery } from '@entities/product';
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

type TRoomState = {
    messageDraft: string;
    statusError?: string;
    messageError?: string;
    reviewError?: string;
    isReviewSent: boolean;
    rating: number;
    comment: string;
};
type TRoomAction = {type: 'update'; payload: Partial<TRoomState>};
const roomReducer = (state: TRoomState, action: TRoomAction): TRoomState => ({
    ...state,
    ...action.payload,
});

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
    const fromProductQuery = useGetProductQuery(chainQuery.data?.from_product_id ?? '', {
        skip: !chainQuery.data?.from_product_id,
    });
    const toProductQuery = useGetProductQuery(chainQuery.data?.to_product_id ?? '', {
        skip: !chainQuery.data?.to_product_id,
    });
    const currentUserQuery = useGetCurrentUserQuery();

    const [updateChainStatus, { isLoading: isStatusUpdating }] = useUpdateChainStatusMutation();
    const [confirmChain, { isLoading: isConfirming }] = useConfirmChainMutation();
    const [sendChainMessage, { isLoading: isMessageSending }] = useSendChainMessageMutation();
    const [createReview, { isLoading: isReviewCreating }] = useCreateReviewMutation();

    const [state, dispatch] = useReducer(roomReducer, {
        messageDraft: '',
        isReviewSent: false,
        rating: 0,
        comment: '',
    });
    const {messageDraft, statusError, messageError, reviewError, isReviewSent, rating, comment} = state;
    const setMessageDraft = (value: string) => dispatch({type: 'update', payload: {messageDraft: value}});
    const setRating = (value: number) => dispatch({type: 'update', payload: {rating: value}});
    const setComment = (value: string) => dispatch({type: 'update', payload: {comment: value}});

    const chain = chainQuery.data;
    const currentUserId = currentUserQuery.data?.customer_id;
    const isInitiator = Boolean(chain && currentUserId && chain.initiator_id === currentUserId);

    const isPendingLike = chain?.status === 'pending' || chain?.status === 'countered';
    const isActive = chain?.status === 'active';
    const isCompleted = chain?.status === 'completed';
    const isUnavailable = chain?.status === 'unavailable';
    const hasConfirmedSuccessfulOutcome = Boolean(
        currentUserId &&
            chainDetailsQuery.data?.confirmations.some(
                (confirmation) =>
                    confirmation.customer_id === currentUserId &&
                    confirmation.result === 'success',
            ),
    );
    const isWaitingForOtherConfirmation = isActive && hasConfirmedSuccessfulOutcome;

    // Общий каталог может быть пагинированным, поэтому добавляем адресно
    // загруженные товары цепочки поверх него.
    const productsById = useMemo(() => {
        const map = new Map<string, TProduct>();
        (productsQuery.data ?? []).forEach((product) => {
            map.set(product.product_id, product);
        });
        if (fromProductQuery.data) {
            map.set(fromProductQuery.data.product_id, fromProductQuery.data);
        }
        if (toProductQuery.data) {
            map.set(toProductQuery.data.product_id, toProductQuery.data);
        }
        return map;
    }, [fromProductQuery.data, productsQuery.data, toProductQuery.data]);

    const fromProduct = chain ? productsById.get(chain.from_product_id) : undefined;
    const toProduct = chain && chain.to_product_id
        ? productsById.get(chain.to_product_id)
        : undefined;

    const handleChangeStatus = useCallback(
        async (status: TUpdateChainStatus) => {
            if (!chainId) return;
            dispatch({type: 'update', payload: {statusError: undefined}});
            try {
                await updateChainStatus({ id: chainId, body: { status } }).unwrap();
                chainQuery.refetch();
            } catch (error) {
                dispatch({type: 'update', payload: {statusError: getErrorMessage(error)}});
            }
        },
        [chainId, updateChainStatus, chainQuery],
    );

    const handleConfirm = useCallback(
        async (success: boolean) => {
            if (!chainId) return;
            dispatch({type: 'update', payload: {statusError: undefined}});
            try {
                await confirmChain({ id: chainId, body: { success } }).unwrap();
                chainQuery.refetch();
                chainDetailsQuery.refetch();
            } catch (error) {
                dispatch({type: 'update', payload: {statusError: getErrorMessage(error)}});
            }
        },
        [chainId, confirmChain, chainQuery, chainDetailsQuery],
    );

    const handleSendMessage = useCallback(async () => {
        if (!chainId) return;
        const body = messageDraft.trim();
        if (!body) return;
        dispatch({type: 'update', payload: {messageError: undefined}});
        try {
            await sendChainMessage({ id: chainId, body: { body } }).unwrap();
            setMessageDraft('');
            messagesQuery.refetch();
        } catch (error) {
            dispatch({type: 'update', payload: {messageError: getErrorMessage(error)}});
        }
    }, [chainId, messageDraft, sendChainMessage, messagesQuery]);

    const handleSendReview = useCallback(async () => {
        if (!chainId || rating < 1) return;
        dispatch({type: 'update', payload: {reviewError: undefined}});
        try {
            await createReview({
                chain_id: chainId,
                rating,
                comment: comment.trim() || undefined,
            }).unwrap();
            dispatch({type: 'update', payload: {isReviewSent: true}});
        } catch (error) {
            dispatch({type: 'update', payload: {reviewError: getErrorMessage(error)}});
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
        isUnavailable,
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
