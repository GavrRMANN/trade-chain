import Styles from "./desktopHeaderMenu.module.css";
import {NavLink} from "react-router-dom";
import LogoSVG from "@shared/assets/logo/logo.svg";
import LogoNameSVG from "@shared/assets/logo/name.svg";
import {SearchInput} from "@shared/ui/searchInput";
import {Button} from "@shared/ui/button";

type TDesktopHeaderMenuProps = {
    value: string;
    setValue: (value: string) => void;
}

export const DesktopHeaderMenu = ({value, setValue}: TDesktopHeaderMenuProps) => {
    return (
        <div className={Styles['header']}>
            <NavLink className={Styles['header__logo']} to={'/'}>
                <img src={LogoSVG} alt={'Логотип'}/>
                <img src={LogoNameSVG} alt={'Авито'}/>
            </NavLink>
            <SearchInput
                value={value}
                onChange={(value) => setValue(value)}
            />
            <Button variant={'default'}>
                Профиль
            </Button>
        </div>
    );
};