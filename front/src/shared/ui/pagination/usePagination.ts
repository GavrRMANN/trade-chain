export const usePagination = ({
    currentPage,
    total,
    onChange,
}: {
    currentPage: number;
    total: number;
    onChange?: (page: number) => void;
}) => {
    const visiblePages = 5;
    const startPage = Math.max(
        Math.min(currentPage - Math.floor(visiblePages / 2), total - visiblePages + 1),
        1,
    );
    const endPage = Math.min(startPage + visiblePages - 1, total);
    const pages = Array.from(
        { length: Math.max(endPage - startPage + 1, 0) },
        (_, index) => startPage + index,
    );
    const handlePageChange = (page: number) => onChange?.(page);

    return { pages, handlePageChange };
};
