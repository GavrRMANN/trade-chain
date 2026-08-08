import Styles from "./desktopHeaderMenu.module.css";
import {NavLink} from "react-router-dom";
import LogoSVG from "@shared/assets/logo/logo.svg";
import LogoNameSVG from "@shared/assets/logo/name.svg";
import {SearchBox} from "@widgets/headerMenu/ui/searchBox";
import {Button} from "@shared/ui/button";
import {useOpenModalRoute} from "@shared/lib";
import {getAuthToken} from "@shared/api";
import {useNavigate} from "react-router-dom";

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
    const openModal = useOpenModalRoute();
    const navigate = useNavigate();

    return (
        <div className={Styles['header']}>
            <NavLink className={Styles['header__logo']} to={'/'}>
                <img src={LogoSVG} alt={'Логотип'}/>
                <img src={LogoNameSVG} alt={'Авито'}/>
            </NavLink>
            <SearchBox value={value} setValue={setValue} search={search} isLoading={isLoading} isError={isError} suggestions={suggestions} selectSuggestion={selectSuggestion}/>
            <Button variant={'default'} onClick={() => getAuthToken() ? navigate('/profile') : openModal('auth')}>
                Профиль
            </Button>
        </div>
    );
};
