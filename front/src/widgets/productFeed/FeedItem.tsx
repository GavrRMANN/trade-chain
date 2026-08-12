import type { TCustomerOverview } from '@entities/customer';
import type { TProduct } from '@entities/product';
import { SellerInfo } from '@widgets/sellerInfo';
import { formatAmount, pluralize } from '@shared/lib';

import { FeedActions } from './FeedActions';
import Styles from './feed-item.module.css';

type TFeedItemProps = {
    product: TProduct;
    /** Название категории товара — если справочник уже загружен. */
    categoryName?: string;
    /** Владелец вещи: имя, рейтинг и число обменов. */
    owner?: TCustomerOverview;
    isDescriptionExpanded: boolean;
    onToggleDescription: () => void;
    onOpenProduct: () => void;
    onOpenOwner: () => void;
    onOfferExchange: () => void;
    onBuildRoute: () => void;
};

/** Порог, после которого описание сворачивается: две строки на мобильном. */
const COLLAPSED_DESCRIPTION_LENGTH = 90;

const EXCHANGE_FORMS: [string, string, string] = ['обмен', 'обмена', 'обменов'];
const REVIEW_FORMS: [string, string, string] = ['отзыв', 'отзыва', 'отзывов'];

/** Имя для подписи: ФИО, а если оно не заполнено — часть адреса до собаки. */
const getOwnerName = (owner?: TCustomerOverview) =>
    owner ? owner.full_name.trim() || owner.email.split('@')[0] : 'Владелец вещи';

/**
 * Строка доверия под именем.
 *
 * Рейтинг показывается только при наличии отзывов: пустые звёзды читаются
 * как оценка «ноль», хотя оценки просто нет. Когда отзывов ещё нет, их
 * заменяет число обменов — иначе о человеке не сказано вообще ничего.
 * Всё сразу в строку не ставится: она обрезается многоточием в узкой панели.
 */
const getOwnerMeta = (owner?: TCustomerOverview) => {
    if (!owner) {
        return 'Профиль, рейтинг и отзывы';
    }

    if (owner.review_count > 0) {
        return `${owner.rating.toFixed(1)} · ${pluralize(owner.review_count, REVIEW_FORMS)}`;
    }

    return owner.chain_count > 0
        ? `Без отзывов · ${pluralize(owner.chain_count, EXCHANGE_FORMS)}`
        : 'Пока без отзывов и обменов';
};

/**
 * Одна карточка ленты: товар на весь экран.
 *
 * Мобильная и desktop-раскладки живут в одной разметке и переключаются
 * только стилями — дублировать содержимое двумя ветками значило бы
 * поддерживать две карточки вместо одной.
 */
export const FeedItem = ({
    product,
    categoryName,
    owner,
    isDescriptionExpanded,
    onToggleDescription,
    onOpenProduct,
    onOpenOwner,
    onOfferExchange,
    onBuildRoute,
}: TFeedItemProps) => {
    const description = product.description?.trim();
    const isLongDescription = Boolean(
        description && description.length > COLLAPSED_DESCRIPTION_LENGTH,
    );
    const price = product.price !== undefined ? formatAmount(product.price) : 'Цена не указана';
    const ownerName = getOwnerName(owner);
    const hasRating = Boolean(owner && owner.review_count > 0);

    return (
        <article
            className={Styles['feed-item']}
            data-feed-item
            aria-label={`${product.title}, ${price}`}
        >
            <div className={Styles['feed-item__media']}>
                {product.image ? (
                    <img
                        className={Styles['feed-item__image']}
                        src={product.image}
                        alt={product.title}
                        loading="lazy"
                    />
                ) : (
                    <div className={Styles['feed-item__image-placeholder']}>
                        <span>Без фото</span>
                    </div>
                )}

                {/* Оверлей нужен только мобильной раскладке: на desktop
                    те же данные читаются в правой панели. */}
                <div className={Styles['feed-item__overlay']}>
                    {product.matched && (
                        <span className={Styles['feed-item__badge']}>Вам подойдёт</span>
                    )}

                    <button
                        type="button"
                        className={Styles['feed-item__owner-link']}
                        onClick={onOpenOwner}
                        aria-label={`Открыть профиль владельца: ${ownerName}`}
                    >
                        <span className={Styles['feed-item__owner-name']}>{ownerName}</span>
                        {hasRating && (
                            <span className={Styles['feed-item__owner-rating']}>
                                ★ {owner?.rating.toFixed(1)}
                            </span>
                        )}
                    </button>

                    <h2 className={Styles['feed-item__title']}>{product.title}</h2>

                    {/* Цена — самый крупный факт под названием, а город и
                        категория рядом метками: строка «цена · город · категория»
                        читалась сплошняком и цену в ней приходилось искать. */}
                    <div className={Styles['feed-item__facts']}>
                        <strong className={Styles['feed-item__price']}>{price}</strong>
                        {product.location && (
                            <span className={Styles['feed-item__fact-chip']}>
                                {product.location}
                            </span>
                        )}
                        {categoryName && (
                            <span className={Styles['feed-item__fact-chip']}>{categoryName}</span>
                        )}
                    </div>

                    {description && (
                        <p
                            className={[
                                Styles['feed-item__description'],
                                !isDescriptionExpanded &&
                                    isLongDescription &&
                                    Styles['feed-item__description--collapsed'],
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            {description}
                        </p>
                    )}

                    {isLongDescription && (
                        <button
                            type="button"
                            className={Styles['feed-item__more']}
                            onClick={onToggleDescription}
                            aria-expanded={isDescriptionExpanded}
                        >
                            {isDescriptionExpanded ? 'Свернуть' : 'Ещё'}
                        </button>
                    )}
                </div>

                <FeedActions
                    productTitle={product.title}
                    variant="compact"
                    onOfferExchange={onOfferExchange}
                    onBuildRoute={onBuildRoute}
                    onOpenProduct={onOpenProduct}
                    onOpenOwner={onOpenOwner}
                />
            </div>

            <aside className={Styles['feed-item__panel']}>
                <div className={Styles['feed-item__panel-head']}>
                    {product.matched && (
                        <span className={Styles['feed-item__panel-badge']}>
                            Вам подойдёт — обмен возможен напрямую
                        </span>
                    )}

                    <h2 className={Styles['feed-item__panel-title']}>{product.title}</h2>
                    <strong className={Styles['feed-item__panel-price']}>{price}</strong>

                    {/* Категория и город — метки, а не таблица: это то, по чему
                        вещь узнают с одного взгляда, наравне с ценой. */}
                    <div className={Styles['feed-item__chips']}>
                        {categoryName && (
                            <span className={Styles['feed-item__chip']}>{categoryName}</span>
                        )}
                        {product.location && (
                            <span className={Styles['feed-item__chip']}>{product.location}</span>
                        )}
                    </div>
                </div>

                <div className={Styles['feed-item__panel-body']}>
                    <p className={Styles['feed-item__panel-description']}>
                        {description || 'Владелец пока не добавил описание.'}
                    </p>

                    {/* Кому доверяешь вещь — часть решения об обмене наравне с
                        самой вещью, поэтому имя, рейтинг и число обменов стоят
                        рядом с описанием, а не прячутся в профиле. */}
                    <div className={Styles['feed-item__owner']}>
                        <SellerInfo
                            name={ownerName}
                            meta={getOwnerMeta(owner)}
                            rating={owner?.rating}
                            hasRating={hasRating}
                            profileId={product.customer_id}
                        />
                    </div>
                </div>

                <FeedActions
                    productTitle={product.title}
                    variant="panel"
                    onOfferExchange={onOfferExchange}
                    onBuildRoute={onBuildRoute}
                    onOpenProduct={onOpenProduct}
                    onOpenOwner={onOpenOwner}
                />
            </aside>
        </article>
    );
};
