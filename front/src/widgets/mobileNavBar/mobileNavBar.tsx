import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import LogoSVG from '@shared/assets/logo/logo.svg';
import PlusSVG from '@shared/assets/icons/Plus.svg?react';
import UserSVG from '@shared/assets/icons/User.svg?react';
import { getAuthToken } from '@shared/api';
import { useOpenModalRoute } from '@shared/lib';
import { ExchangeDirection } from '@shared/ui/exchangeDirection';

import Styles from './mobileNavBar.module.css';

const BellIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 9A6 6 0 0 0 6 9c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </svg>
);

export const MobileNavBar = () => {
    const navigate = useNavigate();
    const openModal = useOpenModalRoute();
    const { pathname } = useLocation();
    const isExchangesPage = pathname.startsWith('/exchanges');
    const isProfilePage = pathname.startsWith('/profile');
    const openProtectedRoute = (path: string) => {
        if (getAuthToken()) {
            navigate(path);
            return;
        }

        openModal('auth');
    };

    return (
        <nav className={Styles['mobile-nav']} aria-label="Основная навигация">
            <NavLink
                className={({isActive}) => [
                    Styles['mobile-nav__item'],
                    isActive && Styles['mobile-nav__item--active'],
                ].filter(Boolean).join(' ')}
                to="/"
                end
            >
                <img className={Styles['mobile-nav__logo']} src={LogoSVG} alt="" />
                <span>Главная</span>
            </NavLink>
            <button
                className={[
                    Styles['mobile-nav__item'],
                    isExchangesPage && Styles['mobile-nav__item--active'],
                ].filter(Boolean).join(' ')}
                type="button"
                onClick={() => openProtectedRoute('/exchanges')}
            >
                <ExchangeDirection className={Styles['mobile-nav__exchange-icon']} />
                <span>Обмены</span>
            </button>
            <button
                className={`${Styles['mobile-nav__item']} ${Styles['mobile-nav__item--create']}`}
                type="button"
                aria-label="Разместить объявление"
                onClick={() => openProtectedRoute('/create')}
            >
                <span className={Styles['mobile-nav__create-icon']}><PlusSVG /></span>
                <span>Добавить</span>
            </button>
            <NavLink
                className={({isActive}) => [
                    Styles['mobile-nav__item'],
                    isActive && Styles['mobile-nav__item--active'],
                ].filter(Boolean).join(' ')}
                to="/notifications"
            >
                <BellIcon />
                <span>Уведомления</span>
            </NavLink>
            <button
                className={[
                    Styles['mobile-nav__item'],
                    isProfilePage && Styles['mobile-nav__item--active'],
                ].filter(Boolean).join(' ')}
                type="button"
                onClick={() => openProtectedRoute('/profile')}
            >
                <UserSVG />
                <span>Профиль</span>
            </button>
        </nav>
    );
};
