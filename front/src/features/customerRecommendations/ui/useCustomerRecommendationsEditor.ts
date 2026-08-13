import {useReducer} from 'react';

import {useGetCategoriesQuery} from '@entities/category';
import {
    useAddMyRecommendationsMutation,
    useDeleteMyRecommendationMutation,
    useGetMyRecommendationsQuery,
} from '@entities/customer';
import {parseApiError} from '@shared/api';

type TEditorState = {
    selectedCategoryId: string;
    requestError?: string;
    isEditing: boolean;
};

type TEditorAction =
    | {type: 'selectCategory'; value: string}
    | {type: 'setError'; value?: string}
    | {type: 'toggleEditing'}
    | {type: 'setEditing'; value: boolean};

const editorReducer = (state: TEditorState, action: TEditorAction): TEditorState => {
    switch (action.type) {
        case 'selectCategory':
            return {...state, selectedCategoryId: action.value};
        case 'setError':
            return {...state, requestError: action.value};
        case 'toggleEditing':
            return {...state, isEditing: !state.isEditing, requestError: undefined};
        case 'setEditing':
            return {...state, isEditing: action.value, requestError: undefined};
    }
};

/** Редактор категорий, которые клиент отмечает как интересные ему. */
export const useCustomerRecommendationsEditor = () => {
    const [{selectedCategoryId, requestError, isEditing}, dispatch] = useReducer(editorReducer, {
        selectedCategoryId: '',
        isEditing: false,
    });

    const {data: categories = []} = useGetCategoriesQuery();
    const {data: recommendations = [], isLoading: isRecommendationsLoading} = useGetMyRecommendationsQuery();
    const [addRecommendations, {isLoading: isAdding}] = useAddMyRecommendationsMutation();
    const [deleteRecommendation, {isLoading: isRemoving}] = useDeleteMyRecommendationMutation();

    const isLoading = isAdding || isRemoving;

    const selectedCategories = recommendations
        .map((recommendation) => categories.find((category) => category.category_id === recommendation.category_id))
        .filter((category) => Boolean(category));

    const availableOptions = categories
        .filter((category) => !recommendations.some((recommendation) => recommendation.category_id === category.category_id))
        .map((category) => ({value: category.category_id, label: category.name}));

    const handleAdd = async () => {
        if (!selectedCategoryId) {
            return;
        }
        dispatch({type: 'setError'});
        try {
            await addRecommendations({category_ids: [selectedCategoryId]}).unwrap();
            dispatch({type: 'selectCategory', value: ''});
        } catch (error) {
            dispatch({type: 'setError', value: parseApiError(error, 'Не удалось обновить список интересов. Попробуйте ещё раз.')});
        }
    };

    const handleRemove = async (categoryId: string) => {
        dispatch({type: 'setError'});
        try {
            await deleteRecommendation(categoryId).unwrap();
        } catch (error) {
            dispatch({type: 'setError', value: parseApiError(error, 'Не удалось обновить список интересов. Попробуйте ещё раз.')});
        }
    };

    const toggleEditing = () => {
        dispatch({type: 'toggleEditing'});
    };
    const startEditing = () => {
        dispatch({type: 'setEditing', value: true});
    };

    return {
        isEditing,
        isLoading,
        isAdding,
        isRecommendationsLoading,
        selectedCategoryId,
        selectedCategories,
        availableOptions,
        requestError,
        setSelectedCategoryId: (value: string) => dispatch({type: 'selectCategory', value}),
        handleAdd,
        handleRemove,
        toggleEditing,
        startEditing,
    };
};
