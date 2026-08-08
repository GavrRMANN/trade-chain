import {SearchInput} from '@shared/ui/searchInput';
import {Spinner} from '@shared/ui/spinner';
import SearchSVG from '@shared/assets/icons/Search.svg?react';
import type {TUseSearchReturn} from '../../lib/useSearch';
import {useSearchBox} from '../../lib/useSearchBox';

import Styles from './searchBox.module.css';

type TSearchBoxProps = TUseSearchReturn;

export const SearchBox = ({
    value,
    setValue,
    search,
    isLoading,
    isError,
    suggestions,
    selectSuggestion,
}: TSearchBoxProps) => {
    const {
        containerRef,
        showSuggestions,
        openSuggestions,
        closeSuggestions,
        clearSearch,
    } = useSearchBox({setValue});

    return (
        <div className={Styles.container} ref={containerRef}>
            <SearchInput
                value={value}
                onChange={setValue}
                onSearch={() => {
                    openSuggestions();
                    search();
                }}
                onFocus={openSuggestions}
                onClear={clearSearch}
                error={{showError: isError, errorMessage: 'Не удалось загрузить подсказки'}}
            />
            {showSuggestions && (
                <div className={Styles.dropdown} role="listbox" aria-label="Подсказки поиска">
                    {isLoading && (
                        <div className={`${Styles.state} ${Styles.loading}`}>
                            <Spinner size="sm" aria-label="Поиск объявлений"/>
                            <span>Ищем объявления…</span>
                        </div>
                    )}
                    {!isLoading && suggestions.length === 0 && (
                        <div className={Styles.state}>Ничего не найдено</div>
                    )}
                    {!isLoading && suggestions.map((suggestion) => (
                        <button
                            className={`${Styles.suggestion} ${Styles[`suggestion--${suggestion.type}`]}`}
                            key={`${suggestion.type}-${suggestion.id}`}
                            type="button"
                            role="option"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                                selectSuggestion(suggestion);
                                closeSuggestions();
                            }}
                        >
                            <span className={Styles.icon} aria-hidden="true">
                                <SearchSVG />
                            </span>
                            <span className={Styles.label}>{suggestion.label}</span>
                            <small>{suggestion.type === 'category' ? 'Категория' : 'Объявление'}</small>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
