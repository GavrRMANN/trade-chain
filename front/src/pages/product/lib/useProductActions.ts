import {useReducer} from 'react';

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

type TActionState = {
    confirmAction: boolean;
    error?: string;
    status?: TProductStatus;
};
type TAction =
    | {type: 'request'}
    | {type: 'cancel'}
    | {type: 'start'}
    | {type: 'success'}
    | {type: 'error'; error: string};

const actionReducer = (state: TActionState, action: TAction): TActionState => {
    switch (action.type) {
        case 'request':
            return { ...state, confirmAction: true, error: undefined };
        case 'cancel':
            return {...state, confirmAction: false};
        case 'start':
            return {...state, error: undefined};
        case 'success':
            return {confirmAction: false, status: 'archived'};
        case 'error':
            return {...state, error: action.error};
    }
};

/**
 * Архивирование товара владельцем после подтверждения.
 */
export const useProductActions = (productId?: string) => {
    const [archiveProduct, {isLoading}] = useArchiveProductMutation();
    const [state, dispatch] = useReducer(actionReducer, {confirmAction: false});

    const requestArchive = () => {
        dispatch({type: 'request'});
    };

    const cancelConfirm = () => dispatch({type: 'cancel'});

    const confirm = async () => {
        if (!productId || !state.confirmAction) return;

        dispatch({type: 'start'});
        try {
            await archiveProduct(productId).unwrap();
            dispatch({type: 'success'});
        } catch (mutationError) {
            dispatch({type: 'error', error: getErrorMessage(mutationError)});
        }
    };

    return {
        status: state.status,
        error: state.error,
        confirmAction: state.confirmAction,
        confirmText: 'Снять товар с обмена? Он уйдёт в архив и перестанет участвовать в обменах.',
        confirmLabel: 'Снять с обмена',
        isLoading,
        requestArchive,
        cancelConfirm,
        confirm,
    };
};
