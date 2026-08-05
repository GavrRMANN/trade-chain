import {useSearch} from "@widgets/headerMenu/lib/useSearch.ts";
import {Suspense} from "react";
import {useIsMobile} from "@shared/lib";
import {HeaderMenuFallback} from "@widgets/headerMenu/ui/headerMenuFallback";
import {DesktopHeaderMenu} from "@widgets/headerMenu/ui/desktopHeaderMenu";
import {MobileHeaderMenu} from "@widgets/headerMenu/ui/mobileHeaderMenu";

export const HeaderMenu = () => {
    const isMobile = useIsMobile();
    const [value, setValue] = useSearch({initialValue: ''});

    return (
        <Suspense fallback={<HeaderMenuFallback/>}>
            {
                isMobile ? <MobileHeaderMenu value={value} setValue={setValue}/> : <DesktopHeaderMenu value={value} setValue={setValue}/>
            }
        </Suspense>
    );
};