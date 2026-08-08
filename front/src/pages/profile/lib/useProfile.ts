import { useMemo, useState } from 'react';

import { useGetProductsByCustomerQuery } from '@entities/product';
import { useGetCustomerRatingQuery, useGetReviewsByCustomerQuery } from '@entities/review';
import type { TUser } from '@entities/user';
import type { TProfileTab } from '@shared/ui/profileContent';

export const useProfile = (user?: TUser) => {
    const [activeTab, setActiveTab] = useState<TProfileTab>('active');
    const customerId = user?.customer_id ?? '';
    const productsQuery = useGetProductsByCustomerQuery(customerId, { skip: !customerId });
    const ratingQuery = useGetCustomerRatingQuery(customerId, { skip: !customerId });
    const reviewsQuery = useGetReviewsByCustomerQuery(customerId, { skip: !customerId });

    const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
    const activeProducts = useMemo(
        () => products.filter(({ status }) => status !== 'archived'),
        [products],
    );
    const archivedProducts = useMemo(
        () => products.filter(({ status }) => status === 'archived'),
        [products],
    );
    const visibleProducts = activeTab === 'active' ? activeProducts : archivedProducts;

    return {
        activeTab,
        setActiveTab,
        activeProducts,
        archivedProducts,
        visibleProducts,
        rating: ratingQuery.data?.average_rating ?? 0,
        reviewsCount: reviewsQuery.data?.length ?? 0,
        isLoading: productsQuery.isLoading,
        isError: productsQuery.isError,
    };
};
