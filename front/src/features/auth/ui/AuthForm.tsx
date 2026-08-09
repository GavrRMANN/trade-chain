import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';

import Styles from './auth-form.module.css';
import { useAuthForm } from './useAuthForm';

export const AuthForm = () => {
    const {
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
    } = useAuthForm();

    return (
        <form className={Styles.form} onSubmit={handleSubmit} noValidate>
            <div className={Styles.fields}>
                <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={email}
                    placeholder="you@example.com"
                    onChange={setEmail}
                    disabled={isLoading}
                    error={{showError: Boolean(errors.email), errorMessage: errors.email ?? ''}}
                />
                <Input
                    label="Пароль"
                    name="password"
                    type="password"
                    value={password}
                    placeholder="Минимум 8 символов"
                    onChange={setPassword}
                    disabled={isLoading}
                    error={{showError: Boolean(errors.password), errorMessage: errors.password ?? ''}}
                />
                {mode === 'register' && (
                    <Input
                        label="Повторите пароль"
                        name="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        placeholder="Повторите пароль"
                        onChange={setConfirmPassword}
                        disabled={isLoading}
                        error={{showError: Boolean(errors.confirmPassword), errorMessage: errors.confirmPassword ?? ''}}
                    />
                )}
            </div>

            {requestError && <p className={Styles.error}>{requestError}</p>}
            {successMessage && <p className={Styles.success}>{successMessage}</p>}

            <Button type="submit" loading={isLoading}>
                {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </Button>

            <Button type="button" variant="text" onClick={switchMode} disabled={isLoading}>
                {mode === 'login' ? 'Создать аккаунт' : 'Уже есть аккаунт? Войти'}
            </Button>
        </form>
    );
};
