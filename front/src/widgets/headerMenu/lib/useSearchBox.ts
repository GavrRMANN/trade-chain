import { useCallback, useEffect, useReducer, useRef, type RefObject } from 'react';

type TUseSearchBoxProps = {
    setValue: (value: string) => void;
};

type TUseSearchBoxReturn = {
    containerRef: RefObject<HTMLDivElement>;
    showSuggestions: boolean;
    openSuggestions: () => void;
    closeSuggestions: () => void;
    clearSearch: () => void;
};

type TSearchBoxState = {
    isOpen: boolean;
};

type TSearchBoxAction = {
    type: 'setOpen';
    value: boolean;
};

const searchBoxReducer = (state: TSearchBoxState, action: TSearchBoxAction): TSearchBoxState => ({
    ...state,
    isOpen: action.value,
});

export const useSearchBox = ({ setValue }: TUseSearchBoxProps): TUseSearchBoxReturn => {
    const [{ isOpen }, dispatch] = useReducer(searchBoxReducer, { isOpen: false });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handlePointerDown = (event: PointerEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                dispatch({ type: 'setOpen', value: false });
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);

        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, []);

    const openSuggestions = useCallback(() => dispatch({ type: 'setOpen', value: true }), []);
    const closeSuggestions = useCallback(() => dispatch({ type: 'setOpen', value: false }), []);
    const clearSearch = useCallback(() => {
        setValue('');
        dispatch({ type: 'setOpen', value: false });
    }, [setValue]);

    return {
        containerRef,
        showSuggestions: isOpen,
        openSuggestions,
        closeSuggestions,
        clearSearch,
    };
};
