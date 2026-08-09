import {FormEvent, useEffect, useState} from 'react';

import {useCreateChainMutation} from '@entities/chain';
import {useGetProductsByCustomerQuery} from '@entities/product';
import {parseApiError} from '@shared/lib';

type TOfferExchangeFormParams = {
    isOpen: boolean;
    targetProductId: string;
    currentCustomerId?: string;
    onSuccess?: (chainId: string) => void;
    onClose: () => void;
};

export const useOfferExchangeForm = ({
    isOpen,
    targetProductId,
    currentCustomerId,
    onSuccess,
    onClose,
}: TOfferExchangeFormParams) => {
    const [selectedProductId, setSelectedProductId] = useState('');
    const [message, setMessage] = useState('');
    const [requestError, setRequestError] = useState<string>();

    const {data: myProducts = [], isLoading: isProductsLoading} = useGetProductsByCustomerQuery(
        currentCustomerId ?? '',
        {skip: !currentCustomerId},
    );
    const [createChain, {isLoading: isCreating}] = useCreateChainMutation();

    useEffect(() => {
        if (isOpen) {
            setSelectedProductId('');
            setMessage('');
            setRequestError(undefined);
        }
    }, [isOpen]);

    const canSubmit = Boolean(selectedProductId) && !isCreating;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setRequestError(undefined);

        if (!selectedProductId) {
            setRequestError('Выберите товар для обмена');
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
            setRequestError(parseApiError(error, 'Не удалось отправить предложение. Попробуйте ещё раз.'));
        }
    };

    return {
        myProducts,
        isProductsLoading,
        isCreating,
        selectedProductId,
        message,
        requestError,
        canSubmit,
        setSelectedProductId,
        setMessage,
        handleSubmit,
    };
};
