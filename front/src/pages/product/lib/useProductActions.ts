import { useState } from 'react';

import { useUpdateProductMutation } from '@entities/product';
import type { TProductStatus } from '@entities/product';

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

type TConfirmAction = 'archive' | null;

/**
 * Управление статусом товара владельцем. Действие выполняется после
 * подтверждения пользователя. Удаление товара на бэкенде не предусмотрено —
 * вместо него используется архивация (PATCH status: 'archived').
 */
export const useProductActions = (productId?: string) => {
    const [updateProduct, { isLoading: isArchiving }] = useUpdateProductMutation();

    const [confirmAction, setConfirmAction] = useState<TConfirmAction>(null);
    const [error, setError] = useState<string>();
    const [status, setStatus] = useState<TProductStatus>();

    const requestArchive = () => {
        setError(undefined);
        setConfirmAction('archive');
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
            const updated = await updateProduct({
                productId,
                data: { status: 'archived' },
            }).unwrap();
            setStatus(updated.status);
            setConfirmAction(null);
        } catch (mutationError) {
            setError(getErrorMessage(mutationError));
        }
    };

    return {
        status,
        error,
        confirmAction,
        confirmText: 'Снять товар с обмена? Он уйдёт в архив и перестанет участвовать в обменах.',
        confirmLabel: 'Снять с обмена',
        isLoading: isArchiving,
        requestArchive,
        cancelConfirm,
        confirm,
    };
};
