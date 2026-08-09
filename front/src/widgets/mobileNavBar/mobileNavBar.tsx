import { NavLink } from 'react-router-dom';

import LogoSVG from '@shared/assets/logo/logo.svg';
import PlusSVG from '@shared/assets/icons/Plus.svg?react';
import UserSVG from '@shared/assets/icons/User.svg?react';
import { ExchangeDirection } from '@shared/ui/exchangeDirection';
import { BellIcon } from '@shared/ui/bellIcon';

import Styles from './mobileNavBar.module.css';
import { useMobileNavBarActions } from './useMobileNavBarActions';

export const MobileNavBar = () => {
    const { isExchangesPage, isProfilePage, onExchanges, onCreate, onProfile } = useMobileNavBarActions();

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
                onClick={onExchanges}
            >
                <ExchangeDirection className={Styles['mobile-nav__exchange-icon']} />
                <span>Обмены</span>
            </button>
            <button
                className={`${Styles['mobile-nav__item']} ${Styles['mobile-nav__item--create']}`}
                type="button"
                aria-label="Разместить объявление"
                onClick={onCreate}
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
                onClick={onProfile}
            >
                <UserSVG />
                <span>Профиль</span>
            </button>
        </nav>
    );
};
