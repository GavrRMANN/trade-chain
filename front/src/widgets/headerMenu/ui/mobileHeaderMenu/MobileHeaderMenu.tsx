import Styles from "./mobileHeaderMenu.module.css";

import LogoSVG from "@shared/assets/logo/logo.svg";
import UserSVG from "@shared/assets/icons/User.svg";

import {SearchInput} from "@shared/ui/searchInput";
import {NavLink} from "react-router-dom";

type TMobileHeaderMenuProps = {
    value: string;
    setValue: (value: string) => void;
}

export const MobileHeaderMenu = ({value, setValue}: TMobileHeaderMenuProps) => {
    return (
        <div className={Styles['header']}>
            <NavLink className={Styles['header__logo']} to={'/'}>
                <img src={LogoSVG} alt={'Логотип'}/>
            </NavLink>
            <SearchInput
                value={value}
                onChange={(value) => setValue(value)}
            />
            <NavLink className={Styles['header__logo']} to={'/'}>
                <img src={UserSVG} alt={'Пользователь'}/>
            </NavLink>
        </div>
    );
};