import {memo} from "react";
import {Button} from "../button";

import Styles from './Pagination.module.css';

import ArrowSVG from '../../assets/icons/Arrow.svg?react';

type TPaginationProps = {
    currentPage: number;
    total: number;
    onChange?: (currentPage: number) => void;
    disabled?: boolean;
    loading?: boolean;
}

export const Pagination = memo(({
                                    currentPage,
                                    total,
                                    onChange,
                                    disabled = false,
                                    loading = false,
                                }: TPaginationProps) => {
    const visiblePages = 5;

    const startPage = Math.max(
        Math.min(
            currentPage - Math.floor(visiblePages / 2),
            total - visiblePages + 1
        ),
        1
    );

    const endPage = Math.min(
        startPage + visiblePages - 1,
        total
    );

    const onBtnClick = (page: number) => {
        onChange?.(page);
    };

    const generateList = () => {
        const pages = [];

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages.map((page) => (
            <Button
                key={page}
                variant={page === currentPage ? 'primary' : 'default'}
                onClick={() => onBtnClick(page)}
                disabled={disabled || loading}
            >
                <span className={Styles['number']}>{page}</span>
            </Button>
        ));
    };

    return (
        <div className={Styles['pagination-block']}>
            <Button
                icon={<ArrowSVG/>}
                variant={'default'}
                disabled={disabled || loading || currentPage === 1}
                onClick={() => onBtnClick(currentPage - 1)}
            />
            {
                generateList()
            }
            <Button
                icon={<ArrowSVG className={Styles['rotate']}/>}
                variant={'default'}
                disabled={disabled || loading || currentPage === total}
                onClick={() => onBtnClick(currentPage + 1)}
            />
        </div>
    );
});