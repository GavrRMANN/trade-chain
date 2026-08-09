import {type KeyboardEvent} from 'react';

import type {TProduct} from '@entities/product';
import {ProductImage} from '@shared/ui/productImage';

import Styles from './ChainRow.module.css';

export type TChainNode = {
    product: TProduct;
    isCurrent?: boolean;
    isGoal?: boolean;
    isDone?: boolean;
};

type TChainRowProps = {
    nodes: TChainNode[];
    onNodeClick?: (productId: string) => void;
    className?: string;
};

export const ChainRow = ({nodes, onNodeClick, className}: TChainRowProps) => {
    if (nodes.length === 0) {
        return null;
    }

    const rowClasses = [
        Styles['chain-row'],
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={rowClasses}>
            {nodes.map((node, index) => {
                const {product, isCurrent, isGoal, isDone} = node;

                const nodeClasses = [
                    Styles['chain-node'],
                    isCurrent && Styles['chain-node--current'],
                    isDone && Styles['chain-node--done'],
                    onNodeClick && Styles['chain-node--clickable'],
                ].filter(Boolean).join(' ');

                const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
                    if (!onNodeClick) {
                        return;
                    }
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onNodeClick(product.product_id);
                    }
                };

                return (
                    <div className={Styles['chain-row__group']} key={product.product_id}>
                        <div
                            className={nodeClasses}
                            role={onNodeClick ? 'button' : undefined}
                            tabIndex={onNodeClick ? 0 : undefined}
                            onClick={onNodeClick ? () => onNodeClick(product.product_id) : undefined}
                            onKeyDown={onNodeClick ? handleKeyDown : undefined}
                        >
                            <div className={Styles['chain-node__media']}>
                                <ProductImage
                                    src={product.image}
                                    alt={product.title}
                                    title={product.title}
                                />
                            </div>

                            <h4 className={Styles['chain-node__title']}>{product.title}</h4>

                            {(isCurrent || isGoal) && (
                                <div className={Styles['chain-node__status-row']}>
                                    {isCurrent && (
                                        <span className={Styles['chain-node__tag']}>Текущий шаг</span>
                                    )}
                                    {isGoal && (
                                        <span className={`${Styles['chain-node__tag']} ${Styles['chain-node__tag--goal']}`}>
                                            Цель
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {index < nodes.length - 1 && (
                            <span className={Styles['chain-separator']} aria-hidden="true">→</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
