import type {TProduct} from '@entities/product';
import {Button} from '@shared/ui/button';
import {ExchangeProducts} from '@widgets/exchangeRow';

import Styles from './exchanges-page.module.css';
import {useRouteGroupCard} from './useRouteGroupCard';

type TRouteGroupCardProps = {
    sourceProduct?: TProduct;
    goalProduct?: TProduct;
    openOffersCount: number;
    offersCount: number;
    updatedAt: string;
    onOpen: () => void;
    formatActiveOffers: (count: number) => string;
    formatDate: (value: string) => string;
};

export const RouteGroupCard = ({
    sourceProduct,
    goalProduct,
    openOffersCount,
    offersCount,
    updatedAt,
    onOpen,
    formatActiveOffers,
    formatDate,
}: TRouteGroupCardProps) => {
    const {offersLabel, detailsLabel} = useRouteGroupCard({
        openOffersCount,
        offersCount,
        updatedAt,
        formatActiveOffers,
        formatDate,
    });

    return (
        <article className={Styles['route-group-card']}>
            <ExchangeProducts
                first={{product: sourceProduct, label: 'Сейчас', tone: 'source'}}
                second={{product: goalProduct, label: 'Цель', tone: 'target'}}
            />
            <footer className={Styles['route-group-card__footer']}>
                <div>
                    <strong>{offersLabel}</strong>
                    <small>{detailsLabel}</small>
                </div>
                <Button variant="secondary" onClick={onOpen}>Открыть</Button>
            </footer>
        </article>
    );
};
