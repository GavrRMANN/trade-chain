import { FormEvent, useEffect, useMemo, useReducer } from 'react';

import { buildChainPayload, useCreateChainMutation } from '@entities/chain';
import type { TRouteContext } from '@entities/chain';
import { useGetCategoriesQuery } from '@entities/category';
import { useGetProductsByCustomerQuery } from '@entities/product';
import type { TProduct } from '@entities/product';
import { parseApiError } from '@shared/api';

import { useMyGoals } from '../lib';

/** Значение выбора «куда засчитать обмен», когда маршрут не выбран. */
export const STANDALONE_GOAL_VALUE = 'standalone';

type TOfferExchangeFormParams = {
    isOpen: boolean;
    targetProductId: string;
    currentCustomerId?: string;
    /**
     * Контекст маршрута, переданный извне — например, при переходе из
     * «Пути к цели» или из ленты, открытой под цель. Когда он есть,
     * привязка предопределена и пользователю не нужно выбирать её руками.
     */
    routeContext?: TRouteContext;
    onSuccess?: (chainId: string) => void;
    onClose: () => void;
};

type TFormState = {
    selectedProductId: string;
    message: string;
    selectedGoalId: string;
    /** Открыта ли короткая форма добавления вещи внутри предложения. */
    isQuickFormOpen: boolean;
    requestError?: string;
};
type TFormAction =
    | { type: 'setProduct'; value: string }
    | { type: 'setMessage'; value: string }
    | { type: 'setGoal'; value: string }
    | { type: 'setError'; value?: string }
    | { type: 'toggleQuickForm'; value: boolean }
    | { type: 'reset' };

const initialState: TFormState = {
    selectedProductId: '',
    message: '',
    selectedGoalId: STANDALONE_GOAL_VALUE,
    isQuickFormOpen: false,
};

const formReducer = (state: TFormState, action: TFormAction): TFormState => {
    switch (action.type) {
        case 'setProduct':
            return { ...state, selectedProductId: action.value };
        case 'setMessage':
            return { ...state, message: action.value };
        case 'setGoal':
            return { ...state, selectedGoalId: action.value, requestError: undefined };
        case 'setError':
            return { ...state, requestError: action.value };
        case 'toggleQuickForm':
            return { ...state, isQuickFormOpen: action.value };
        case 'reset':
            return initialState;
    }
};

export const useOfferExchangeForm = ({
    isOpen,
    targetProductId,
    currentCustomerId,
    routeContext,
    onSuccess,
    onClose,
}: TOfferExchangeFormParams) => {
    const [
        { selectedProductId, message, selectedGoalId, isQuickFormOpen, requestError },
        dispatch,
    ] = useReducer(formReducer, initialState);

    const {
        data: myProductsData,
        isLoading,
        isFetching,
        refetch: refetchProducts,
    } = useGetProductsByCustomerQuery(currentCustomerId ?? '', { skip: !currentCustomerId });
    const [createChain, { isLoading: isCreating }] = useCreateChainMutation();
    // Список маршрутов нужен только когда пользователь выбирает привязку сам:
    // с готовым контекстом извне выбор уже сделан за него.
    const { goals, isLoading: isGoalsLoading } = useMyGoals({
        skip: !isOpen || Boolean(routeContext),
    });
    // Категории нужны только короткой форме добавления вещи.
    const { data: categories = [] } = useGetCategoriesQuery(undefined, { skip: !isOpen });
    const availableProducts = (myProductsData ?? []).filter(
        (product) => product.status === 'active',
    );
    const isProductsLoading = isLoading || isFetching;

    useEffect(() => {
        if (isOpen) {
            dispatch({ type: 'reset' });
            if (currentCustomerId) {
                void refetchProducts();
            }
        }
    }, [currentCustomerId, isOpen, refetchProducts]);

    const selectedGoal = useMemo(
        () => goals.find((goal) => goal.goalId === selectedGoalId),
        [goals, selectedGoalId],
    );

    /**
     * Контекст извне приоритетнее ручного выбора: пользователь пришёл из
     * конкретного маршрута, и переспрашивать его об этом незачем.
     */
    const effectiveRouteContext = routeContext ?? selectedGoal?.routeContext;

    const canSubmit =
        availableProducts.some((product) => product.product_id === selectedProductId) &&
        !isCreating;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        dispatch({ type: 'setError' });

        if (!availableProducts.some((product) => product.product_id === selectedProductId)) {
            dispatch({ type: 'setError', value: 'Выберите товар для обмена' });
            return;
        }

        try {
            const created = await createChain(
                buildChainPayload({
                    fromProductId: selectedProductId,
                    toProductId: targetProductId,
                    message,
                    routeContext: effectiveRouteContext,
                }),
            ).unwrap();

            onSuccess?.(created.chain_id);
            onClose();
        } catch (error) {
            dispatch({
                type: 'setError',
                value: parseApiError(
                    error,
                    'Не удалось отправить предложение. Попробуйте ещё раз.',
                ),
            });
        }
    };

    /**
     * После быстрого создания вещь сразу выбрана в предложении: возвращать
     * пользователя к пустому списку значило бы просить его повторить выбор,
     * ради которого он и заполнял форму.
     */
    const handleQuickProductCreated = async (product: TProduct) => {
        dispatch({ type: 'toggleQuickForm', value: false });
        dispatch({ type: 'setProduct', value: product.product_id });
        await refetchProducts();
    };

    return {
        myProducts: availableProducts,
        isProductsLoading,
        isCreating,
        categories,
        isQuickFormOpen,
        openQuickForm: () => dispatch({ type: 'toggleQuickForm', value: true }),
        closeQuickForm: () => dispatch({ type: 'toggleQuickForm', value: false }),
        handleQuickProductCreated,
        selectedProductId,
        message,
        requestError,
        canSubmit,
        goals,
        isGoalsLoading,
        selectedGoalId,
        /** Маршрут, к которому будет привязано предложение, — для сводки в форме. */
        boundGoalTitle: routeContext?.goalTitle ?? selectedGoal?.goalTitle,
        /** Привязка пришла извне и не редактируется в форме. */
        isGoalLocked: Boolean(routeContext),
        setSelectedProductId: (value: string) => dispatch({ type: 'setProduct', value }),
        setMessage: (value: string) => dispatch({ type: 'setMessage', value }),
        setSelectedGoalId: (value: string) => dispatch({ type: 'setGoal', value }),
        handleSubmit,
    };
};
