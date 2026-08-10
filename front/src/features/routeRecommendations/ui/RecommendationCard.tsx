import { Button } from '@shared/ui/button';
import { ProductImage } from '@entities/product';
import { ChainStatusBadge } from '@entities/chain';

import type { TRouteRecommendation } from './RouteRecommendations';
import Styles from './route-recommendations.module.css';
import {useRecommendationCard} from './useRecommendationCard';

type TRecommendationCardProps = {
    item: TRouteRecommendation;
    selected: boolean;
    compact?: boolean;
    onToggle: (selected: boolean) => void;
    onOpenProduct: () => void;
    onOpenOffer: () => void;
};

export const RecommendationCard = ({
    item,
    selected,
    compact = false,
    onToggle,
    onOpenProduct,
    onOpenOffer,
}: TRecommendationCardProps) => {
    const {product, offer, classes, priceLabel, locationLabel} = useRecommendationCard(item, selected, compact);

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
                        <ChainStatusBadge status={offer.status} />
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
                        {priceLabel}
                    </strong>
                    <span>{locationLabel}</span>
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
