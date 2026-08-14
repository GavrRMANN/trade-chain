import { memo } from 'react';
import { Button } from '../button';

import Styles from './Pagination.module.css';

import ArrowSVG from '../../assets/icons/Arrow.svg?react';
import { usePagination } from './usePagination';

type TPaginationProps = {
    currentPage: number;
    total: number;
    onChange?: (currentPage: number) => void;
    disabled?: boolean;
    loading?: boolean;
};

export const Pagination = memo(
    ({ currentPage, total, onChange, disabled = false, loading = false }: TPaginationProps) => {
        const { pages, handlePageChange } = usePagination({ currentPage, total, onChange });

        return (
            <div className={Styles['pagination-block']}>
                <Button
                    icon={<ArrowSVG />}
                    variant={'default'}
                    disabled={disabled || loading || currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                />
                {pages.map((page) => (
                    <Button
                        key={page}
                        variant={page === currentPage ? 'primary' : 'default'}
                        onClick={() => handlePageChange(page)}
                        disabled={disabled || loading}
                    >
                        <span className={Styles.number}>{page}</span>
                    </Button>
                ))}
                <Button
                    icon={<ArrowSVG className={Styles['rotate']} />}
                    variant={'default'}
                    disabled={disabled || loading || currentPage === total}
                    onClick={() => handlePageChange(currentPage + 1)}
                />
            </div>
        );
    },
);
