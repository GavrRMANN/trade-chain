import type { TChain } from '@entities/chain';
import type { TProduct } from '@entities/product';
import { Button } from '@shared/ui/button';

import { formatVariantCount } from '../lib';
import { RecommendationCard } from './RecommendationCard';
import Styles from './route-recommendations.module.css';
import { useRailCountdown } from './useRailCountdown';
import {useRouteRecommendations} from './useRouteRecommendations';

export type TRouteRecommendation = {
    product: TProduct;
    offer?: TChain;
    /** Этот вариант входит в найденный маршрут до цели. */
    isBestMatch?: boolean;
};

type TRouteRecommendationsProps = {
    items: TRouteRecommendation[];
    selectedIds: string[];
    isSubmitting: boolean;
    /** Сколько вариантов осталось за пределами ряда — их видно только в ленте. */
    hiddenCount?: number;
    onToggle: (productId: string, selected: boolean) => void;
    onSubmit: () => void;
    onOpenProduct: (productId: string) => void;
    onOpenOffer: (chainId: string) => void;
    /** Открывает подборку лентой. Без него блок остаётся сам по себе. */
    onOpenFeed?: () => void;
};

export const RouteRecommendations = ({
    items,
    selectedIds,
    isSubmitting,
    hiddenCount = 0,
    onToggle,
    onSubmit,
    onOpenProduct,
    onOpenOffer,
    onOpenFeed,
}: TRouteRecommendationsProps) => {
    const {activeIndex, current, selected, advance, selectAndAdvance, handlePointerDown, handlePointerUp} =
        useRouteRecommendations(items, selectedIds, onToggle);
    const {railRef, remaining} = useRailCountdown(items.length);

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
            <div ref={railRef} className={Styles.rail} aria-label="Варианты следующего обмена">
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

                {/* Плитка закреплена у правого края ряда: карточки выезжают
                    из-под неё, и пока под ней что-то спрятано, она ведёт
                    отсчёт — сколько предложений ряда ещё не показано. Когда
                    ряд домотан, прятать больше нечего, и плитка светлеет,
                    предлагая уже всю подборку. */}
                {onOpenFeed && (
                    <button
                        type="button"
                        className={[
                            Styles.rail__more,
                            remaining === 0 && Styles['rail__more--ready'],
                        ]
                            .filter(Boolean)
                            .join(' ')}
                        onClick={onOpenFeed}
                        aria-label="Перейти к подборке"
                    >
                        {remaining > 0 ? (
                            <span className={Styles['rail__more-countdown']} aria-hidden="true">
                                <span className={Styles['rail__more-hint']}>осталось</span>
                                <span className={Styles['rail__more-count']}>{remaining}</span>
                            </span>
                        ) : (
                            <>
                                <span className={Styles['rail__more-arrow']} aria-hidden="true">
                                    <svg viewBox="0 0 24 24" focusable="false">
                                        <path d="M5 12h13l-5-5" />
                                        <path d="M18 12l-5 5" />
                                    </svg>
                                </span>
                                <span className={Styles['rail__more-label']} aria-hidden="true">
                                    {hiddenCount > 0
                                        ? `Посмотреть ещё ${formatVariantCount(hiddenCount)}`
                                        : 'Посмотреть'}
                                </span>
                            </>
                        )}
                    </button>
                )}
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

            {/* Вход в подборку прижат к правому краю ряда и выезжает из-под
                карточек: ряд листается вбок и обрывается справа, поэтому
                «дальше» должно читаться там же, где обрыв, а не отдельной
                кнопкой в шапке блока. */}
            {/* На телефоне ряда нет — карточки листает свайпер, и вставить
                плитку в конец нечего: переход становится обычной кнопкой
                во всю ширину под свайпером. */}
            {onOpenFeed && (
                <div className={Styles.more}>
                    <Button className={Styles.more__button} onClick={onOpenFeed}>
                        {hiddenCount > 0
                            ? `Ещё ${formatVariantCount(hiddenCount)}`
                            : 'Перейти к подборке'}
                    </Button>
                </div>
            )}

            {/* Счётчик появляется только когда есть что считать: правило «можно
                выбрать несколько» уже сказано в подзаголовке блока. */}
            <div className={Styles.submit}>
                {selectedIds.length > 0 && (
                    <span>Выбрано вариантов: {selectedIds.length}</span>
                )}
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
