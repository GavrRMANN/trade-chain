import Styles from "@widgets/headerMenu/ui/desktopHeaderMenu/desktopHeaderMenu.module.css";
import {NavLink} from "react-router-dom";
import LogoSVG from "@shared/assets/logo/logo.svg";
import LogoNameSVG from "@shared/assets/logo/name.svg";

export const HeaderMenuFallback = () => {
    return (
        <div className={Styles['header']}>
            <NavLink className={Styles['header__logo']} to={'/'}>
                <img src={LogoSVG} alt={'Логотип'}/>
                <img src={LogoNameSVG} alt={'Авито'}/>
            </NavLink>
        </div>
    );
};