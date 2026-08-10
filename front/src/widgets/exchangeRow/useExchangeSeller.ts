import { useGetCustomerQuery } from '@entities/customer';

/**
 * Загружает данные продавца целевого товара (toProduct).
 * Холдит запрос, если customer_id отсутствует.
 */
export const useExchangeSeller = (customerId?: string) => {
    const { data } = useGetCustomerQuery(customerId ?? '', {
        skip: !customerId,
    });

    return { sellerEmail: data?.email };
};
