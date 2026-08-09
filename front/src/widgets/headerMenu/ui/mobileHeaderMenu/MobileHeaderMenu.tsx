import Styles from "./mobileHeaderMenu.module.css";

import {SearchBox} from "@widgets/headerMenu/ui/searchBox";

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
    return (
        <div className={Styles['header']}>
            <SearchBox value={value} setValue={setValue} search={search} isLoading={isLoading} isError={isError} suggestions={suggestions} selectSuggestion={selectSuggestion}/>
        </div>
    );
};
