import {FormEvent, useEffect, useReducer} from 'react';

import {useCreateChainMutation} from '@entities/chain';
import {useGetProductsByCustomerQuery} from '@entities/product';
import {parseApiError} from '@shared/api';

type TOfferExchangeFormParams = {
    isOpen: boolean;
    targetProductId: string;
    currentCustomerId?: string;
    onSuccess?: (chainId: string) => void;
    onClose: () => void;
};

type TFormState = {selectedProductId: string; message: string; requestError?: string};
type TFormAction =
    | {type: 'setProduct'; value: string}
    | {type: 'setMessage'; value: string}
    | {type: 'setError'; value?: string}
    | {type: 'reset'};

const formReducer = (state: TFormState, action: TFormAction): TFormState => {
    switch (action.type) {
        case 'setProduct': return {...state, selectedProductId: action.value};
        case 'setMessage': return {...state, message: action.value};
        case 'setError': return {...state, requestError: action.value};
        case 'reset': return {selectedProductId: '', message: ''};
    }
};

export const useOfferExchangeForm = ({
    isOpen,
    targetProductId,
    currentCustomerId,
    onSuccess,
    onClose,
}: TOfferExchangeFormParams) => {
    const [{selectedProductId, message, requestError}, dispatch] = useReducer(formReducer, {
        selectedProductId: '',
        message: '',
    });

    const {
        data: myProducts = [],
        isLoading,
        isFetching,
        refetch: refetchProducts,
    } = useGetProductsByCustomerQuery(
        currentCustomerId ?? '',
        {skip: !currentCustomerId},
    );
    const [createChain, {isLoading: isCreating}] = useCreateChainMutation();
    const availableProducts = myProducts.filter((product) => product.status === 'active');
    const isProductsLoading = isLoading || isFetching;

    useEffect(() => {
        if (isOpen) {
            dispatch({type: 'reset'});
            if (currentCustomerId) {
                void refetchProducts();
            }
        }
    }, [currentCustomerId, isOpen, refetchProducts]);

    const canSubmit =
        availableProducts.some((product) => product.product_id === selectedProductId) && !isCreating;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        dispatch({type: 'setError'});

        if (!availableProducts.some((product) => product.product_id === selectedProductId)) {
            dispatch({type: 'setError', value: 'Выберите товар для обмена'});
            return;
        }

        try {
            const created = await createChain({
                from_product_id: selectedProductId,
                to_product_id: targetProductId,
                status: 'pending',
                message: message.trim() || undefined,
            }).unwrap();

            onSuccess?.(created.chain_id);
            onClose();
        } catch (error) {
            dispatch({type: 'setError', value: parseApiError(error, 'Не удалось отправить предложение. Попробуйте ещё раз.')});
        }
    };

    return {
        myProducts: availableProducts,
        isProductsLoading,
        isCreating,
        selectedProductId,
        message,
        requestError,
        canSubmit,
        setSelectedProductId: (value: string) => dispatch({type: 'setProduct', value}),
        setMessage: (value: string) => dispatch({type: 'setMessage', value}),
        handleSubmit,
    };
};
