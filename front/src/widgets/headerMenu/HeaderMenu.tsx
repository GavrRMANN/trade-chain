import {useSearch} from "@widgets/headerMenu/lib/useSearch.ts";
import {useIsMobile} from "@shared/lib";
import {DesktopHeaderMenu} from "@widgets/headerMenu/ui/desktopHeaderMenu";
import {MobileHeaderMenu} from "@widgets/headerMenu/ui/mobileHeaderMenu";

export const HeaderMenu = () => {
    const isMobile = useIsMobile();
    const search = useSearch({initialValue: ''});

    return (
        isMobile
            ? <MobileHeaderMenu {...search}/>
            : <DesktopHeaderMenu {...search}/>
    );
};
