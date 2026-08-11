import { FormEvent, useCallback, useReducer } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
    setCredentials,
    useLoginUserMutation,
    useRegisterUserMutation,
} from '@entities/user';
import { parseApiError } from '@shared/api';
import { useAppDispatch } from '@app/redux';
import { getBackgroundRoute } from '@features/auth';

type TMode = 'login' | 'register';
type TField = 'email' | 'password' | 'confirmPassword';
type TErrors = Partial<Record<TField, string>>;
type TAuthState = {
    mode: TMode;
    email: string;
    password: string;
    confirmPassword: string;
    errors: TErrors;
    requestError?: string;
    successMessage?: string;
};
type TAuthAction =
    | {type: 'setField'; field: 'email' | 'password' | 'confirmPassword'; value: string}
    | {type: 'setMode'; value: TMode}
    | {type: 'setErrors'; value: TErrors}
    | {type: 'setRequestError'; value?: string}
    | {type: 'setSuccessMessage'; value?: string};

const authReducer = (state: TAuthState, action: TAuthAction): TAuthState => {
    switch (action.type) {
        case 'setField': return {...state, [action.field]: action.value};
        case 'setMode': return {...state, mode: action.value};
        case 'setErrors': return {...state, errors: action.value};
        case 'setRequestError': return {...state, requestError: action.value};
        case 'setSuccessMessage': return {...state, successMessage: action.value};
    }
};

const validate = (email: string, password: string, confirmPassword: string, mode: TMode): TErrors => {
    const errors: TErrors = {};

    if (!email.trim()) {
        errors.email = 'Введите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Введите корректный email';
    }

    if (!password) {
        errors.password = 'Введите пароль';
    } else if (password.length < 8) {
        errors.password = 'Пароль должен содержать минимум 8 символов';
    }

    if (mode === 'register' && password !== confirmPassword) {
        errors.confirmPassword = 'Пароли не совпадают';
    }

    return errors;
};

export const useAuthForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const reduxDispatch = useAppDispatch();

    const [{mode, email, password, confirmPassword, errors, requestError, successMessage}, dispatch] = useReducer(
        authReducer,
        {mode: 'login', email: '', password: '', confirmPassword: '', errors: {}},
    );

    const [loginUser, { isLoading: isLoginLoading }] = useLoginUserMutation();
    const [registerUser, { isLoading: isRegisterLoading }] = useRegisterUserMutation();

    const isLoading = isLoginLoading || isRegisterLoading;

    const switchMode = () => {
        dispatch({type: 'setMode', value: mode === 'login' ? 'register' : 'login'});
        dispatch({type: 'setErrors', value: {}});
        dispatch({type: 'setRequestError'});
        dispatch({type: 'setSuccessMessage'});
        dispatch({type: 'setField', field: 'confirmPassword', value: ''});
    };

    const getBackgroundRouteCallback = useCallback(() => {
        return getBackgroundRoute(location);
    }, [location]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        dispatch({type: 'setRequestError'});
        dispatch({type: 'setSuccessMessage'});

        const validationErrors = validate(email, password, confirmPassword, mode);

        dispatch({type: 'setErrors', value: validationErrors});

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        try {
            if (mode === 'login') {
                const response = await loginUser({email: email.trim(), password}).unwrap();

                reduxDispatch(setCredentials(response.token));
                navigate(getBackgroundRouteCallback(), { replace: true });

                return;
            }

            const response = await registerUser({email: email.trim(), password}).unwrap();

            reduxDispatch(setCredentials(response.token));
            navigate(getBackgroundRouteCallback(), { replace: true });
        } catch (error) {
            dispatch({type: 'setRequestError', value: parseApiError(error)});
        }
    };

    return {
        mode,
        email,
        password,
        confirmPassword,
        errors,
        requestError,
        successMessage,
        isLoading,
        setEmail: (value: string) => dispatch({type: 'setField', field: 'email', value}),
        setPassword: (value: string) => dispatch({type: 'setField', field: 'password', value}),
        setConfirmPassword: (value: string) => dispatch({type: 'setField', field: 'confirmPassword', value}),
        handleSubmit,
        switchMode,
    };
};
