import {useCallback, useEffect, useRef, useState, type RefObject} from 'react';

type TUseSearchBoxProps = {
    setValue: (value: string) => void;
};

type TUseSearchBoxReturn = {
    containerRef: RefObject<HTMLDivElement | null>;
    showSuggestions: boolean;
    openSuggestions: () => void;
    closeSuggestions: () => void;
    clearSearch: () => void;
};

export const useSearchBox = ({setValue}: TUseSearchBoxProps): TUseSearchBoxReturn => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handlePointerDown = (event: PointerEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);

        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, []);

    const openSuggestions = useCallback(() => setIsOpen(true), []);
    const closeSuggestions = useCallback(() => setIsOpen(false), []);
    const clearSearch = useCallback(() => {
        setValue('');
        setIsOpen(false);
    }, [setValue]);

    return {
        containerRef,
        showSuggestions: isOpen,
        openSuggestions,
        closeSuggestions,
        clearSearch,
    };
};
