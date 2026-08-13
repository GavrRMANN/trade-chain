import type { RefObject } from 'react';

import type { TCustomerOverview } from '@entities/customer';
import type { TProduct } from '@entities/product';
import { Spinner } from '@shared/ui/spinner';

import { type TFeedOfferAction } from './FeedActions';
import { FeedItem } from './FeedItem';
import Styles from './product-feed.module.css';
import { useProductFeed } from './useProductFeed';

export type TProductFeedProps = {
    products: TProduct[];
    /** Есть ли ещё страницы — лента показывает подгрузку в конце. Без
        постраничной выдачи (готовая подборка) не задаётся. */
    hasMore?: boolean;
    /** Идёт ли догрузка следующей страницы. */
    isFetching?: boolean;
    /** Sentinel каталога: на нём висит IntersectionObserver постраничной догрузки. */
    loadMoreRef?: RefObject<HTMLDivElement>;
    /** Названия категорий по идентификатору — для подписи на карточке. */
    categoryNames?: Map<string, string>;
    /** Владельцы вещей по идентификатору: имя, рейтинг и число обменов. */
    owners?: Map<string, TCustomerOverview>;
    /** Главные действия карточек по идентификатору товара — если лента
        открыта не каталогом и действие означает не «выбрать, что отдать». */
    offerActions?: Map<string, TFeedOfferAction>;
    onOpenProduct: (productId: string) => void;
    onOpenOwner: (customerId: string) => void;
    onOfferExchange: (productId: string) => void;
    /** Не задан там, где цепочку строить уже не из чего — внутри самого маршрута. */
    onBuildRoute?: (productId: string) => void;
    /** Цель, под которую открыта лента, — показывается закреплённой плашкой. */
    goalTitle?: string;
    /** Карточка, с которой открыть ленту: сохранённая позиция пользователя. */
    initialIndex?: number;
    /** Ключ выдачи: при его смене лента открывается сначала. */
    positionKey?: string;
    /** Сообщает наружу карточку, на которую перешёл пользователь. */
    onActiveIndexChange?: (index: number) => void;
};

/**
 * Вертикальная лента товаров: одна вещь за раз, действие под рукой.
 *
 * Лента — второе представление того же каталога, а не отдельный экран со
 * своей механикой: данные приходят снаружи, а все действия уходят наружу
 * колбэками в уже существующие сценарии обмена.
 */
export const ProductFeed = ({
    products,
    hasMore = false,
    isFetching = false,
    loadMoreRef,
    categoryNames,
    owners,
    offerActions,
    onOpenProduct,
    onOpenOwner,
    onOfferExchange,
    onBuildRoute,
    goalTitle,
    initialIndex,
    positionKey,
    onActiveIndexChange,
}: TProductFeedProps) => {
    const { containerRef, viewportHeight, handleKeyDown, expandedIds, toggleDescription } =
        useProductFeed(products.length, { initialIndex, positionKey, onActiveIndexChange });

    if (products.length === 0 && !isFetching) {
        return (
            <div className={Styles['product-feed__empty']}>
                <h2>Здесь пока пусто</h2>
                <p>Попробуйте снять фильтр по категории или поискать другими словами.</p>
            </div>
        );
    }

    return (
        <div className={Styles['product-feed']}>
            {goalTitle && (
                <p className={Styles['product-feed__goal']}>
                    <span className={Styles['product-feed__goal-label']}>Путь к цели</span>
                    <strong className={Styles['product-feed__goal-title']}>{goalTitle}</strong>
                </p>
            )}

            <div
                ref={containerRef}
                className={Styles['product-feed__viewport']}
                style={viewportHeight ? { height: `${viewportHeight}px` } : undefined}
                tabIndex={0}
                role="feed"
                aria-label="Лента вещей в обороте"
                onKeyDown={handleKeyDown}
            >
                {products.map((product) => (
                    <FeedItem
                        key={product.product_id}
                        product={product}
                        categoryName={
                            product.category_id
                                ? categoryNames?.get(product.category_id)
                                : undefined
                        }
                        owner={owners?.get(product.customer_id)}
                        offerAction={offerActions?.get(product.product_id)}
                        isDescriptionExpanded={expandedIds.has(product.product_id)}
                        onToggleDescription={() => toggleDescription(product.product_id)}
                        onOpenProduct={() => onOpenProduct(product.product_id)}
                        onOpenOwner={() => onOpenOwner(product.customer_id)}
                        onOfferExchange={() => onOfferExchange(product.product_id)}
                        onBuildRoute={
                            onBuildRoute ? () => onBuildRoute(product.product_id) : undefined
                        }
                    />
                ))}

                {hasMore && (
                    <div ref={loadMoreRef} className={Styles['product-feed__sentinel']}>
                        {isFetching && <Spinner aria-label="Загружаем ещё вещи" />}
                    </div>
                )}
            </div>
        </div>
    );
};
