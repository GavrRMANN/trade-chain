import {useState} from 'react';
import {useNavigate} from 'react-router-dom';

import {useDeleteProductMutation, useUpdateProductMutation} from '@entities/product';
import type {TProductStatus} from '@entities/product';

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

type TConfirmAction = 'archive' | 'delete' | null;

/**
 * Управление статусом и удалением товара владельцем.
 * Действия выполняются после подтверждения пользователя.
 */
export const useProductActions = (productId?: string) => {
    const navigate = useNavigate();

    const [updateProduct, {isLoading: isArchiving}] = useUpdateProductMutation();
    const [deleteProduct, {isLoading: isDeleting}] = useDeleteProductMutation();

    const [confirmAction, setConfirmAction] = useState<TConfirmAction>(null);
    const [error, setError] = useState<string>();
    const [status, setStatus] = useState<TProductStatus>();

    const requestArchive = () => {
        setError(undefined);
        setConfirmAction('archive');
    };

    const requestDelete = () => {
        setError(undefined);
        setConfirmAction('delete');
    };

    const cancelConfirm = () => {
        setConfirmAction(null);
    };

    const confirm = async () => {
        if (!productId || !confirmAction) {
            return;
        }

        setError(undefined);
        try {
            if (confirmAction === 'archive') {
                const updated = await updateProduct({
                    productId,
                    data: {status: 'archived'},
                }).unwrap();
                setStatus(updated.status);
            } else {
                await deleteProduct(productId).unwrap();
                navigate('/');
            }
            setConfirmAction(null);
        } catch (mutationError) {
            setError(getErrorMessage(mutationError));
        }
    };

    return {
        status,
        error,
        confirmAction,
        confirmText:
            confirmAction === 'archive'
                ? 'Снять товар с обмена? Он уйдёт в архив и перестанет участвовать в обменах.'
                : 'Удалить товар без возможности восстановления?',
        confirmLabel: confirmAction === 'archive' ? 'Снять с обмена' : 'Удалить',
        isLoading: isArchiving || isDeleting,
        requestArchive,
        requestDelete,
        cancelConfirm,
        confirm,
    };
};
