import Styles from "./mobileHeaderMenu.module.css";

import LogoSVG from "@shared/assets/logo/logo.svg";
import UserSVG from "@shared/assets/icons/User.svg";
import PlusSVG from "@shared/assets/icons/Plus.svg?react";

import {SearchBox} from "@widgets/headerMenu/ui/searchBox";
import {NavLink, useNavigate} from "react-router-dom";
import {useOpenModalRoute} from "@shared/lib";
import {getAuthToken} from "@shared/api";

type TMobileHeaderMenuProps = {
    value: string;
    setValue: (value: string) => void;
    search: () => void;
    isLoading: boolean;
    isError: boolean;
    suggestions: import('../../lib/useSearch').TSearchSuggestion[];
    selectSuggestion: import('../../lib/useSearch').TUseSearchReturn['selectSuggestion'];
}

export const MobileHeaderMenu = ({value, setValue, search, isLoading, isError, suggestions, selectSuggestion}: TMobileHeaderMenuProps) => {
    const openModal = useOpenModalRoute();
    const navigate = useNavigate();

    return (
        <div className={Styles['header']}>
            <NavLink className={Styles['header__logo']} to={'/'}>
                <img src={LogoSVG} alt={'Логотип'}/>
            </NavLink>
            <SearchBox value={value} setValue={setValue} search={search} isLoading={isLoading} isError={isError} suggestions={suggestions} selectSuggestion={selectSuggestion}/>
            <button
                className={Styles['header__action']}
                type="button"
                aria-label="Разместить объявление"
                onClick={() => getAuthToken() ? navigate('/create') : openModal('auth')}
            >
                <PlusSVG/>
            </button>
            <button
                className={Styles['header__profile']}
                type="button"
                aria-label="Открыть профиль"
                onClick={() => getAuthToken() ? navigate('/profile') : openModal('auth')}
            >
                <img src={UserSVG} alt={'Пользователь'}/>
            </button>
        </div>
    );
};
