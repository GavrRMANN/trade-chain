import { FormEvent, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
    useLoginUserMutation,
    useRegisterUserMutation,
} from '@entities/user';
import { setAuthToken } from '@shared/api';
import { getBackgroundRoute, parseApiError } from '@shared/lib';

type TMode = 'login' | 'register';
type TField = 'email' | 'password' | 'confirmPassword';
type TErrors = Partial<Record<TField, string>>;

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

    const [mode, setMode] = useState<TMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<TErrors>({});
    const [requestError, setRequestError] = useState<string>();
    const [successMessage, setSuccessMessage] = useState<string>();

    const [loginUser, { isLoading: isLoginLoading }] = useLoginUserMutation();
    const [registerUser, { isLoading: isRegisterLoading }] = useRegisterUserMutation();

    const isLoading = isLoginLoading || isRegisterLoading;

    const switchMode = () => {
        setMode((currentMode) => currentMode === 'login' ? 'register' : 'login');
        setErrors({});
        setRequestError(undefined);
        setSuccessMessage(undefined);
        setConfirmPassword('');
    };

    const getBackgroundRouteCallback = useCallback(() => {
        return getBackgroundRoute(location);
    }, [location.state]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setRequestError(undefined);
        setSuccessMessage(undefined);

        const validationErrors = validate(email, password, confirmPassword, mode);

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        try {
            if (mode === 'login') {
                const response = await loginUser({email: email.trim(), password}).unwrap();

                setAuthToken(response.token);
                navigate(getBackgroundRouteCallback(), { replace: true });

                return;
            }

            const response = await registerUser({email: email.trim(), password}).unwrap();

            setAuthToken(response.token);
            navigate(getBackgroundRouteCallback(), { replace: true });
        } catch (error) {
            setRequestError(parseApiError(error));
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
        setEmail,
        setPassword,
        setConfirmPassword,
        handleSubmit,
        switchMode,
    };
};
