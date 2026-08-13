import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useProductForm } from './useProductForm';

export const useCreateProductPage = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();

    const form = useProductForm(productId);

    const title = form.isEdit ? 'Редактирование объявления' : 'Новое объявление';

    const goBack = useCallback(() => navigate(-1), [navigate]);

    return {
        form,
        title,
        goBack,
    };
};
