import type {TRouteRecommendation} from './RouteRecommendations';
import Styles from './route-recommendations.module.css';
import {formatAmount} from '@shared/lib';

export const useRecommendationCard = (
    item: TRouteRecommendation,
    selected: boolean,
    compact: boolean,
) => ({
    product: item.product,
    offer: item.offer,
    isBestMatch: item.isBestMatch,
    priceLabel: item.product.price === undefined ? 'Цена не указана' : formatAmount(item.product.price),
    locationLabel: item.product.location ?? 'Город не указан',
    classes: [
        Styles.recommendation,
        selected && Styles['recommendation--selected'],
        item.offer && Styles['recommendation--sent'],
        compact && Styles['recommendation--compact'],
    ].filter(Boolean).join(' '),
});
