import type { TChain } from '@entities/chain';
import type { TProduct } from '@entities/product';
import { Button } from '@shared/ui/button';

import { RecommendationCard } from './RecommendationCard';
import Styles from './route-recommendations.module.css';
import {useRouteRecommendations} from './useRouteRecommendations';

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

export const RouteRecommendations = ({
    items,
    selectedIds,
    isSubmitting,
    onToggle,
    onSubmit,
    onOpenProduct,
    onOpenOffer,
}: TRouteRecommendationsProps) => {
    const {activeIndex, current, selected, advance, selectAndAdvance, handlePointerDown, handlePointerUp} =
        useRouteRecommendations(items, selectedIds, onToggle);

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
