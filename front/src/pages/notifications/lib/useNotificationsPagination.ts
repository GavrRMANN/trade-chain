import {useEffect, useLayoutEffect, useRef, useState} from 'react';

const LIST_GAP = 12;
const FOOTER_HEIGHT = 40;
const BOTTOM_SPACE = 16;

const getMobileNavigationHeight = () => Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--mobile-nav-height'),
) || 0;

/** Рассчитывает вместимость списка по фактической высоте карточек и viewport. */
export const useNotificationsPagination = (totalItems: number) => {
    const listRef = useRef<HTMLDivElement>(null);
    const paginationRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(1);

    useLayoutEffect(() => {
        const list = listRef.current;
        if (!list || totalItems === 0) return;

        const updateItemsPerPage = () => {
            const itemHeights = Array.from(list.children).map((item) => item.getBoundingClientRect().height);
            const itemHeight = Math.max(...itemHeights, 0);
            if (itemHeight === 0) return;

            const paginationHeight = paginationRef.current?.getBoundingClientRect().height || FOOTER_HEIGHT;
            const availableHeight = window.innerHeight
                - list.getBoundingClientRect().top
                - paginationHeight
                - getMobileNavigationHeight()
                - BOTTOM_SPACE;
            const nextItemsPerPage = Math.max(1, Math.floor((availableHeight + LIST_GAP) / (itemHeight + LIST_GAP)));

            setItemsPerPage((value) => value === nextItemsPerPage ? value : nextItemsPerPage);
        };

        const observer = new ResizeObserver(updateItemsPerPage);
        observer.observe(list);
        window.addEventListener('resize', updateItemsPerPage);
        updateItemsPerPage();

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateItemsPerPage);
        };
    }, [currentPage, totalItems]);

    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    useEffect(() => {
        setCurrentPage((page) => Math.min(page, totalPages));
    }, [totalPages]);

    return {
        currentPage,
        itemsPerPage,
        listRef,
        paginationRef,
        setCurrentPage,
        totalPages,
    };
};
