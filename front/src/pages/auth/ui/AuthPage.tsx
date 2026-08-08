import { useEffect, useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AuthForm } from '@features/auth';
import { usePageTitle } from '@app/providers/pageTitle';
import { getAuthToken } from '@shared/api';
import LogoSVG from '@shared/assets/logo/logo.svg';
import LogoNameSVG from '@shared/assets/logo/name.svg';

import Styles from './auth-page.module.css';

export const AuthPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {setTitle} = usePageTitle();
    const isAuthenticated = Boolean(getAuthToken());

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        const backgroundLocation = location.state?.backgroundLocation;
        const redirectTo = backgroundLocation
            ? {
                pathname: backgroundLocation.pathname,
                search: backgroundLocation.search,
                hash: backgroundLocation.hash,
            }
            : '/';

        navigate(redirectTo, {replace: true});
    }, [isAuthenticated, location.state, navigate]);

    useLayoutEffect(() => {
        setTitle('');
    }, [setTitle]);

    if (isAuthenticated) {
        return null;
    }

    return (
        <section className={Styles.page}>
            <div className={Styles.card}>
                <div className={Styles.brand} aria-label="Авито">
                    <img src={LogoSVG} alt="" />
                    <img src={LogoNameSVG} alt="Авито" />
                </div>
                <div className={Styles.heading}>
                    <p className={Styles.eyebrow}>Всё нужное рядом</p>
                    <h1>Добро пожаловать</h1>
                </div>
                <p className={Styles.description}>
                    Войдите, чтобы покупать, продавать и находить нужные товары.
                </p>
                <AuthForm />
                <p className={Styles.legal}>
                    Продолжая, вы соглашаетесь с условиями использования сервиса
                </p>
            </div>
        </section>
    );
};
