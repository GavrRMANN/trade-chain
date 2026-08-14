import { Button } from '@shared/ui/button';
import { ProductImage } from '@entities/product';
import { ChainStatusBadge } from '@entities/chain';

import type { TRouteRecommendation } from './RouteRecommendations';
import Styles from './route-recommendations.module.css';
import { useRecommendationCard } from './useRecommendationCard';

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
    const { product, offer, isBestMatch, classes, priceLabel, locationLabel } =
        useRecommendationCard(item, selected, compact);

    return (
        <article className={classes}>
            <button
                type="button"
                className={Styles.recommendation__media}
                onClick={onOpenProduct}
                aria-label={`Открыть товар ${product.title}`}
            >
                <ProductImage src={product.image} alt={product.title} title={product.title} />
                {/* Отличает вещь найденного маршрута от остальных вариантов:
                    те подобраны лишь по прямому обмену с текущей вещью, и
                    путь к цели через них не посчитан. */}
                {isBestMatch && (
                    <span className={Styles.recommendation__badge}>Лучший вариант</span>
                )}
                {/* Отметка о выборе живёт на превью, а переключает его кнопка
                    внизу карточки: галочка рядом с названием повторяла то же
                    действие и отбирала у него половину строки. */}
                {selected && (
                    <span className={Styles.recommendation__check} aria-hidden="true">
                        ✓
                    </span>
                )}
            </button>

            <div className={Styles.recommendation__body}>
                <div className={Styles.recommendation__heading}>
                    <h3 className={Styles.recommendation__title}>{product.title}</h3>
                    {offer && <ChainStatusBadge status={offer.status} />}
                </div>

                <div className={Styles.recommendation__facts}>
                    <strong>{priceLabel}</strong>
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
                    /* В свайпере выбор переключают крупные кнопки под карточкой —
                       своя кнопка внутри неё была бы третьим способом сделать
                       одно и то же на одном экране. */
                    !compact && (
                        <Button
                            className={Styles.recommendation__button}
                            variant={selected ? 'primary' : 'secondary'}
                            onClick={() => onToggle(!selected)}
                        >
                            {selected ? 'Убрать из выбора' : 'Предложить обмен'}
                        </Button>
                    )
                )}
            </div>
        </article>
    );
};
