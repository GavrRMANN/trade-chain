import { useCallback, useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useOpenModalRoute } from '@shared/lib';
import { usePageTitle } from '@app/providers/pageTitle';

import { useProductForm } from './useProductForm';

export const useCreateProductPage = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const { setTitle } = usePageTitle();
    const openModal = useOpenModalRoute();

    const form = useProductForm(productId);

    useLayoutEffect(() => {
        setTitle(form.isEdit ? 'Редактирование объявления' : 'Новое объявление');
    }, [setTitle, form.isEdit]);

    const openAuth = useCallback(() => openModal('auth'), [openModal]);

    const goBack = useCallback(() => navigate(-1), [navigate]);

    return {
        form,
        openAuth,
        goBack,
    };
};
