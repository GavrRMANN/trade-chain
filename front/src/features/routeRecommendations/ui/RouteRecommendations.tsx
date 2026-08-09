import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';

import type { TChain } from '@entities/chain';
import type { TProduct } from '@entities/product';
import { Button } from '@shared/ui/button';
import { ProductImage } from '@shared/ui/productImage';
import { StatusBadge } from '@shared/ui/statusBadge';
import { formatAmount } from '@shared/lib';

import Styles from './route-recommendations.module.css';

export type TRouteRecommendation = {
    product: TProduct;
    offer?: TChain;
};

type TRouteRecommendationsProps = {
    items: TRouteRecommendation[];
    selectedIds: string[];
    isSubmitting: boolean;
    onToggle: (productId: string, selected: boolean) => void;
    onSubmit: () => void;
    onOpenProduct: (productId: string) => void;
    onOpenOffer: (chainId: string) => void;
};

type TRecommendationCardProps = {
    item: TRouteRecommendation;
    selected: boolean;
    compact?: boolean;
    onToggle: (selected: boolean) => void;
    onOpenProduct: () => void;
    onOpenOffer: () => void;
};

const RecommendationCard = ({
    item,
    selected,
    compact = false,
    onToggle,
    onOpenProduct,
    onOpenOffer,
}: TRecommendationCardProps) => {
    const { product, offer } = item;
    const classes = [
        Styles.recommendation,
        selected && Styles['recommendation--selected'],
        offer && Styles['recommendation--sent'],
        compact && Styles['recommendation--compact'],
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <article className={classes}>
            <button
                type="button"
                className={Styles.recommendation__media}
                onClick={onOpenProduct}
                aria-label={`Открыть товар ${product.title}`}
            >
                <ProductImage src={product.image} alt={product.title} title={product.title} />
            </button>

            <div className={Styles.recommendation__body}>
                <div className={Styles.recommendation__heading}>
                    <h3 className={Styles.recommendation__title}>{product.title}</h3>
                    {offer ? (
                        <StatusBadge status={offer.status} />
                    ) : (
                        <label className={Styles.recommendation__choice}>
                            <input
                                type="checkbox"
                                checked={selected}
                                onChange={(event) => onToggle(event.target.checked)}
                            />
                            <span>{selected ? 'Выбрано' : 'Выбрать'}</span>
                        </label>
                    )}
                </div>

                <div className={Styles.recommendation__facts}>
                    <strong>
                        {product.price === undefined
                            ? 'Цена не указана'
                            : formatAmount(product.price)}
                    </strong>
                    <span>{product.location ?? 'Город не указан'}</span>
                </div>

                {offer?.status === 'active' ? (
                    <Button className={Styles.recommendation__button} onClick={onOpenOffer}>
                        Открыть обмен
                    </Button>
                ) : offer ? (
                    <Button className={Styles.recommendation__button} variant="secondary" disabled>
                        Предложение отправлено
                    </Button>
                ) : (
                    <Button
                        className={Styles.recommendation__button}
                        variant={selected ? 'primary' : 'secondary'}
                        onClick={() => onToggle(!selected)}
                    >
                        {selected ? 'Убрать из выбора' : 'Предложить обмен'}
                    </Button>
                )}
            </div>
        </article>
    );
};

export const RouteRecommendations = ({
    items,
    selectedIds,
    isSubmitting,
    onToggle,
    onSubmit,
    onOpenProduct,
    onOpenOffer,
}: TRouteRecommendationsProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const pointerStartX = useRef<number | undefined>(undefined);
    const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

    useEffect(() => {
        if (activeIndex >= items.length) {
            setActiveIndex(Math.max(0, items.length - 1));
        }
    }, [activeIndex, items.length]);

    const current = items[activeIndex];

    const advance = () => {
        setActiveIndex((index) => (items.length === 0 ? 0 : (index + 1) % items.length));
    };

    const selectAndAdvance = () => {
        if (!current || current.offer) {
            advance();
            return;
        }
        onToggle(current.product.product_id, true);
        advance();
    };

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        pointerStartX.current = event.clientX;
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
        if (pointerStartX.current === undefined) {
            return;
        }

        const distance = event.clientX - pointerStartX.current;
        pointerStartX.current = undefined;

        if (distance <= -60) {
            selectAndAdvance();
        } else if (distance >= 60) {
            advance();
        }
    };

    if (items.length === 0) {
        return (
            <div className={Styles.empty}>
                <h3>Подходящих вариантов пока нет</h3>
                <p>Маршрут пересчитается, когда появятся новые товары.</p>
            </div>
        );
    }

    return (
        <>
            <div className={Styles.rail} aria-label="Варианты следующего обмена">
                {items.map((item) => (
                    <RecommendationCard
                        key={item.product.product_id}
                        item={item}
                        selected={selected.has(item.product.product_id)}
                        onToggle={(value) => onToggle(item.product.product_id, value)}
                        onOpenProduct={() => onOpenProduct(item.product.product_id)}
                        onOpenOffer={() => item.offer && onOpenOffer(item.offer.chain_id)}
                    />
                ))}
            </div>

            {current && (
                <div className={Styles.swiper}>
                    <div
                        className={Styles.swiper__viewport}
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerUp}
                    >
                        <RecommendationCard
                            item={current}
                            selected={selected.has(current.product.product_id)}
                            compact
                            onToggle={(value) => onToggle(current.product.product_id, value)}
                            onOpenProduct={() => onOpenProduct(current.product.product_id)}
                            onOpenOffer={() => current.offer && onOpenOffer(current.offer.chain_id)}
                        />
                        {items.length > 1 && (
                            <span className={Styles.swiper__peek} aria-hidden="true" />
                        )}
                    </div>

                    <div
                        className={Styles.swiper__dots}
                        aria-label={`Вариант ${activeIndex + 1} из ${items.length}`}
                    >
                        {items.map((item, index) => (
                            <span
                                key={item.product.product_id}
                                className={
                                    index === activeIndex
                                        ? Styles['swiper__dot--active']
                                        : Styles.swiper__dot
                                }
                            />
                        ))}
                    </div>

                    <div className={Styles.swiper__actions}>
                        <Button variant="secondary" onClick={advance}>
                            Пропустить
                        </Button>
                        <Button onClick={selectAndAdvance} disabled={Boolean(current.offer)}>
                            {current.offer ? 'Уже отправлено' : 'Предложить'}
                        </Button>
                    </div>
                    <p className={Styles.swiper__hint}>
                        Свайп влево — предложить, вправо — пропустить
                    </p>
                </div>
            )}

            <div className={Styles.submit}>
                <span>
                    {selectedIds.length > 0
                        ? `Выбрано вариантов: ${selectedIds.length}`
                        : 'Можно выбрать несколько вариантов'}
                </span>
                <Button
                    onClick={onSubmit}
                    disabled={selectedIds.length === 0}
                    loading={isSubmitting}
                >
                    Отправить предложения
                </Button>
            </div>
        </>
    );
};
