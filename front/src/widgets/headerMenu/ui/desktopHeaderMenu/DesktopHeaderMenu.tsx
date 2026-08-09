import Styles from "./desktopHeaderMenu.module.css";
import {NavLink} from "react-router-dom";
import LogoSVG from "@shared/assets/logo/logo.svg";
import LogoNameSVG from "@shared/assets/logo/name.svg";
import PlusSVG from "@shared/assets/icons/Plus.svg?react";
import UserSVG from "@shared/assets/icons/User.svg?react";
import {ExchangeDirection} from "@shared/ui/exchangeDirection";
import {SearchBox} from "@widgets/headerMenu/ui/searchBox";
import {NotificationBell} from "@widgets/headerMenu/ui/notificationBell";
import {Button} from "@shared/ui/button";

import {useDesktopHeaderActions} from "./useDesktopHeaderActions";

type TDesktopHeaderMenuProps = {
    value: string;
    setValue: (value: string) => void;
    search: () => void;
    isLoading: boolean;
    isError: boolean;
    suggestions: import('../../lib/useSearch').TSearchSuggestion[];
    selectSuggestion: import('../../lib/useSearch').TUseSearchReturn['selectSuggestion'];
}

export const DesktopHeaderMenu = ({value, setValue, search, isLoading, isError, suggestions, selectSuggestion}: TDesktopHeaderMenuProps) => {
    const {isExchangesPage, isCreatePage, isProfilePage, onCreate, onExchanges, onProfile} = useDesktopHeaderActions();
    const getActionClassName = (isActive: boolean) => [
        Styles['header__action'],
        isActive && Styles['header__action--active'],
    ].filter(Boolean).join(' ');

    return (
        <div className={Styles['header']}>
            <NavLink className={Styles['header__logo']} to={'/'}>
                <img src={LogoSVG} alt={'Логотип'}/>
                <img src={LogoNameSVG} alt={'Авито'}/>
            </NavLink>
            <SearchBox value={value} setValue={setValue} search={search} isLoading={isLoading} isError={isError} suggestions={suggestions} selectSuggestion={selectSuggestion}/>
            <Button
                variant={'default'}
                icon={<span className={Styles['header__plus-icon']}><PlusSVG/></span>}
                ariaLabel="Разместить объявление"
                className={getActionClassName(isCreatePage)}
                onClick={onCreate}
            />
            <Button
                variant={'default'}
                icon={<ExchangeDirection className={Styles['header__exchange-icon']}/>}
                ariaLabel="Мои обмены"
                className={getActionClassName(isExchangesPage)}
                onClick={onExchanges}
            />
            <NotificationBell
                compact
                className={Styles['header__action']}
                activeClassName={Styles['header__action--active']}
            />
            <Button
                variant={'default'}
                icon={<span className={Styles['header__menu-icon']}><UserSVG/></span>}
                ariaLabel="Открыть профиль"
                className={getActionClassName(isProfilePage)}
                onClick={onProfile}
            />
        </div>
    );
};
