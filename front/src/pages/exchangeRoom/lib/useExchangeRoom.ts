import { useMemo, useState } from 'react';

import {
    useConfirmChainMutation,
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
import { getAuthToken } from '@shared/api';

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

export const useExchangeRoom = (chainId?: string) => {
    const isAuthenticated = Boolean(getAuthToken());

    const chainQuery = useGetChainQuery(chainId ?? '', { skip: !chainId });
    const messagesQuery = useGetChainMessagesQuery(chainId ?? '', { skip: !chainId });
    const productsQuery = useGetProductsQuery(undefined, { skip: !isAuthenticated });
    const currentUserQuery = useGetCurrentUserQuery(undefined, { skip: !isAuthenticated });

    const [updateChainStatus, { isLoading: isStatusUpdating }] = useUpdateChainStatusMutation();
    const [confirmChain, { isLoading: isConfirming }] = useConfirmChainMutation();
    const [sendChainMessage, { isLoading: isMessageSending }] = useSendChainMessageMutation();
    const [createReview, { isLoading: isReviewCreating }] = useCreateReviewMutation();

    const [messageDraft, setMessageDraft] = useState('');
    const [statusError, setStatusError] = useState<string>();
    const [messageError, setMessageError] = useState<string>();
    const [reviewError, setReviewError] = useState<string>();
    const [isReviewSent, setIsReviewSent] = useState(false);

    const chain = chainQuery.data;
    const currentUserId = currentUserQuery.data?.customer_id;
    const isInitiator = Boolean(chain && currentUserId && chain.initiator_id === currentUserId);

    // Резолвим оба товара цепочки из общего списка продуктов клиентской картой.
    const productsById = useMemo(() => {
        const map = new Map<string, TProduct>();
        (productsQuery.data ?? []).forEach((product) => {
            map.set(product.product_id, product);
        });
        return map;
    }, [productsQuery.data]);

    const fromProduct = chain ? productsById.get(chain.from_product_id) : undefined;
    const toProduct = chain ? productsById.get(chain.to_product_id) : undefined;

    const handleChangeStatus = async (status: TUpdateChainStatus) => {
        if (!chainId) {
            return;
        }
        setStatusError(undefined);
        try {
            await updateChainStatus({ id: chainId, body: { status } }).unwrap();
            chainQuery.refetch();
        } catch (error) {
            setStatusError(getErrorMessage(error));
        }
    };

    const handleConfirm = async (success: boolean) => {
        if (!chainId) {
            return;
        }
        setStatusError(undefined);
        try {
            await confirmChain({ id: chainId, body: { success } }).unwrap();
            chainQuery.refetch();
        } catch (error) {
            setStatusError(getErrorMessage(error));
        }
    };

    const handleSendMessage = async () => {
        if (!chainId) {
            return;
        }
        const body = messageDraft.trim();
        if (!body) {
            return;
        }
        setMessageError(undefined);
        try {
            await sendChainMessage({ id: chainId, body: { body } }).unwrap();
            setMessageDraft('');
            messagesQuery.refetch();
        } catch (error) {
            setMessageError(getErrorMessage(error));
        }
    };

    const handleSendReview = async (rating: number, comment: string) => {
        if (!chainId) {
            return;
        }
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
    };

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
        isAuthenticated,
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
        handleSendReview,
        isReviewCreating,
        reviewError,
        isReviewSent,
    };
};
