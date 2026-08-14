import { useReducer } from 'react';

import { useArchiveProductMutation } from '@entities/product';

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

type TState = { error?: string };
type TAction = { type: 'start' } | { type: 'error'; error: string };

const reducer = (state: TState, action: TAction): TState =>
    action.type === 'start' ? {} : { ...state, error: action.error };

/**
 * Архивирование товара владельцем.
 *
 * Подтверждение живёт в маршруте модалки, поэтому хук отвечает только за сам
 * запрос: успех закрывает окно, а карточка товара перечитывается по
 * инвалидации тега Product и сама переходит в архивный вид.
 *
 * @param productId Товар, который снимают с обмена.
 * @param onSuccess Вызывается после успешного архивирования.
 */
export const useArchiveProduct = (productId: string, onSuccess: () => void) => {
    const [archiveProduct, { isLoading }] = useArchiveProductMutation();
    const [state, dispatch] = useReducer(reducer, {});

    const confirm = async () => {
        if (!productId) return;

        dispatch({ type: 'start' });
        try {
            await archiveProduct(productId).unwrap();
            onSuccess();
        } catch (mutationError) {
            dispatch({ type: 'error', error: getErrorMessage(mutationError) });
        }
    };

    return {
        confirm,
        isLoading,
        error: state.error,
    };
};
