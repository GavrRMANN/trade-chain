import {useState} from 'react';

import {useArchiveProductMutation} from '@entities/product';
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

/**
 * Архивирование товара владельцем после подтверждения.
 */
export const useProductActions = (productId?: string) => {
    const [archiveProduct, {isLoading}] = useArchiveProductMutation();
    const [confirmAction, setConfirmAction] = useState(false);
    const [error, setError] = useState<string>();
    const [status, setStatus] = useState<TProductStatus>();

    const requestArchive = () => {
        setError(undefined);
        setConfirmAction(true);
    };

    const cancelConfirm = () => setConfirmAction(false);

    const confirm = async () => {
        if (!productId || !confirmAction) return;

        setError(undefined);
        try {
            await archiveProduct(productId).unwrap();
            setStatus('archived');
            setConfirmAction(false);
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
        isLoading,
        requestArchive,
        cancelConfirm,
        confirm,
    };
};
