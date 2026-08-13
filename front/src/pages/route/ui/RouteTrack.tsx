import type { KeyboardEvent, ReactNode } from 'react';

import { ProductImage } from '@entities/product';
import type { TProduct } from '@entities/product';
import { ExchangeDirection } from '@shared/ui/exchangeDirection';
import { formatAmount } from '@shared/lib';

import { formatExchangeCount } from '../lib';
import Styles from './route-page.module.css';

type TRouteStepProps = {
    label: string;
    title: string;
    note: ReactNode;
    product?: TProduct;
    tone?: 'goal';
    onOpen?: () => void;
};

const RouteStep = ({ label, title, note, product, tone, onOpen }: TRouteStepProps) => {
    const classes = [
        Styles['route-track__step'],
        tone === 'goal' && Styles['route-track__step--goal'],
    ]
        .filter(Boolean)
        .join(' ');

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (!onOpen || (event.key !== 'Enter' && event.key !== ' ')) {
            return;
        }

        event.preventDefault();
        onOpen();
    };

    return (
        <div
            className={classes}
            role={onOpen ? 'button' : undefined}
            tabIndex={onOpen ? 0 : undefined}
            onClick={onOpen}
            onKeyDown={handleKeyDown}
        >
            <span className={Styles['route-track__label']}>{label}</span>

            <div className={Styles['route-track__body']}>
                {product && (
                    <div className={Styles['route-track__media']}>
                        <ProductImage src={product.image} alt={title} title={title} />
                    </div>
                )}
                <div className={Styles['route-track__text']}>
                    <strong className={Styles['route-track__title']}>{title}</strong>
                    <span className={Styles['route-track__note']}>{note}</span>
                </div>
            </div>
        </div>
    );
};

type TRouteTrackProps = {
    currentProduct: TProduct;
    goalProduct?: TProduct;
    categoryName?: string;
    stepsRemaining: number;
    onOpenProduct: (productId: string) => void;
};

/**
 * Путь одной строкой: что на руках сейчас и к чему он ведёт.
 *
 * Шапка держит цель текстом, но выбор следующего обмена — это сравнение двух
 * вещей, и обе должны быть видны рядом. Пара со стрелкой между ними — та же,
 * что в карточке обмена, поэтому читается без пояснений; акцентная подложка
 * остаётся только на цели, ради которой открыт экран.
 */
export const RouteTrack = ({
    currentProduct,
    goalProduct,
    categoryName,
    stepsRemaining,
    onOpenProduct,
}: TRouteTrackProps) => (
    <section className={Styles['route-track']} aria-label="Путь до цели">
        <RouteStep
            label="Сейчас у вас"
            title={currentProduct.title}
            product={currentProduct}
            note={
                <>
                    <strong>
                        {currentProduct.price === undefined
                            ? 'Цена не указана'
                            : formatAmount(currentProduct.price)}
                    </strong>
                    {currentProduct.location && <span>{currentProduct.location}</span>}
                </>
            }
            onOpen={() => onOpenProduct(currentProduct.product_id)}
        />

        <div className={Styles['route-track__connector']}>
            <ExchangeDirection />
        </div>

        <RouteStep
            label="Цель"
            tone="goal"
            title={goalProduct ? goalProduct.title : (categoryName ?? 'категория')}
            product={goalProduct}
            note={
                goalProduct
                    ? stepsRemaining === 0
                        ? 'Цель достигнута'
                        : `${formatExchangeCount(stepsRemaining)} до цели`
                    : 'Любой товар из категории'
            }
            onOpen={goalProduct ? () => onOpenProduct(goalProduct.product_id) : undefined}
        />
    </section>
);
