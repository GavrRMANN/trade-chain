import { useLayoutEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { usePageTitle } from '@app/providers/pageTitle';
import { ProductSection } from '@shared/ui/productSection';
import { ProductImage } from '@shared/ui/productImage';
import { SellerInfo } from '@shared/ui/sellerInfo';
import { MainSection } from '@shared/ui/mainSection';
import { Preloader } from '@shared/ui/preloader';
import { ProductCard } from '@shared/ui/productCard';
import { Button } from '@shared/ui/button';
import { Modal } from '@shared/ui/modal';
import { Rating } from '@shared/ui/rating';
import { ReviewCard } from '@shared/ui/reviewCard';
import { OfferExchangeModal } from '@features/exchange';
import { WishlistEditor } from '@features/wishlist';
import { ChainRow } from '@shared/ui/chainRow';
import { formatAmount } from '@shared/lib';
import { useProductPageData, useProductActions } from '../lib';

import Styles from './product-page.module.css';
import { PageError } from '@shared/ui/pageError';

const statusLabels = {
    active: 'Товар активен',
    reserved: 'Товар зарезервирован',
    exchanged: 'Товар обменян',
    archived: 'Товар в архиве',
} as const;

export const ProductPage = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const { setTitle } = usePageTitle();

    const {
        product,
        customer,
        wishlist,
        wishlistOptions,
        matchingProducts,
        routeChain,
        reviews,
        averageRating,
        incomingOffers,
        isOwner,
        currentUserId,
        isLoading,
        isError,
    } = useProductPageData(productId);

    const [isOfferOpen, setIsOfferOpen] = useState(false);

    const {
        requestArchive,
        cancelConfirm,
        confirm,
        confirmAction,
        confirmText,
        confirmLabel,
        isLoading: isActionLoading,
        error: actionError,
    } = useProductActions(product?.product_id);

    useLayoutEffect(() => {
        if (!product) {
            setTitle('');
            return;
        }

        const price = product.price !== undefined ? formatAmount(product.price) : 'Цена не указана';
        setTitle(`${product.title} · ${price}`);
    }, [product, setTitle]);

    if (isLoading) {
        return <Preloader />;
    }

    if (isError || !product) {
        return <PageError message={'Не удалось загрузить товар'} />;
    }

    const sellerName = customer?.email || 'Email не указан';
    const hasRating = typeof averageRating === 'number' && averageRating > 0;
    const ratingText = hasRating
        ? `${averageRating?.toFixed(1)} · Отзывов: ${reviews.length}`
        : reviews.length
          ? `Отзывов: ${reviews.length}`
          : 'Пока без отзывов';
    const statusLabel = statusLabels[product.status];

    return (
        <MainSection>
            <div className={Styles.page}>
                <div className={Styles.hero}>
                    <div className={Styles.mediaColumn}>
                        <ProductImage
                            src={product.image}
                            alt={product.title}
                            title={product.title}
                        />
                        <div className={Styles.details}>
                            <ProductSection title="Характеристики">
                                <dl className={Styles.characteristics}>
                                    <div>
                                        <dt>Статус</dt>
                                        <dd>{statusLabel}</dd>
                                    </div>
                                    <div>
                                        <dt>Город</dt>
                                        <dd>{product.location || 'Не указан'}</dd>
                                    </div>
                                    <div>
                                        <dt>Цена</dt>
                                        <dd className={Styles.strong}>
                                            {product.price !== undefined
                                                ? formatAmount(product.price)
                                                : 'Не указана'}
                                        </dd>
                                    </div>
                                </dl>
                            </ProductSection>

                            <ProductSection title="Описание">
                                <p className={Styles.description}>
                                    {product.description || 'Описание не указано.'}
                                </p>
                            </ProductSection>
                        </div>
                    </div>
                    <aside className={Styles.productAside}>
                        {isOwner ? (
                            <>
                                <Button
                                    variant="secondary"
                                    onClick={() => navigate(`/product/${product.product_id}/edit`)}
                                >
                                    Редактировать
                                </Button>
                                <div className={Styles.offers}>
                                    <span className={Styles.offersCount}>
                                        Входящих предложений: {incomingOffers}
                                    </span>
                                    <Button variant="text" onClick={() => navigate('/exchanges')}>
                                        Перейти к предложениям
                                    </Button>
                                </div>
                                {product.status === 'active' ? (
                                    <div className={Styles.management}>
                                        <Button variant="secondary" onClick={requestArchive}>
                                            Снять с обмена
                                        </Button>
                                    </div>
                                ) : (
                                    <p className={Styles.muted}>Товар снят с обмена</p>
                                )}
                            </>
                        ) : (
                            <>
                                <div className={Styles.status}>{statusLabel}</div>
                                <Button onClick={() => setIsOfferOpen(true)}>
                                    Предложить обмен
                                </Button>
                                <OfferExchangeModal
                                    isOpen={isOfferOpen}
                                    onClose={() => setIsOfferOpen(false)}
                                    onSuccess={(chainId) => navigate(`/exchanges/${chainId}`)}
                                    targetProductId={product.product_id}
                                    currentCustomerId={currentUserId}
                                />
                            </>
                        )}

                        <div className={Styles.reputation}>
                            {hasRating && <Rating value={averageRating ?? 0} />}
                            <SellerInfo
                                name={sellerName}
                                meta={ratingText}
                                profileId={product.customer_id}
                            />
                        </div>

                        {reviews.length > 0 && (
                            <section className={Styles.reviews} aria-label="Отзывы о продавце">
                                <h2>Отзывы</h2>
                                <ul className={Styles.reviewsList}>
                                    {reviews.slice(0, 3).map((review) => (
                                        <li key={review.review_id}>
                                            <ReviewCard review={review} />
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        <section className={Styles.exchange}>
                            <h2>{isOwner ? 'Хочу взамен' : 'Что хочет взамен'}</h2>
                            {isOwner ? (
                                <WishlistEditor
                                    productId={product.product_id}
                                    productTitle={product.title}
                                    wishlist={wishlist}
                                    options={wishlistOptions}
                                />
                            ) : wishlist && wishlistOptions.length ? (
                                <div className={Styles.wishlist}>
                                    {wishlistOptions.map((option) => (
                                        <span key={option.category_id}>{option.name}</span>
                                    ))}
                                </div>
                            ) : wishlist ? (
                                <p className={Styles.muted}>{wishlist.name}</p>
                            ) : (
                                <p className={Styles.muted}>
                                    Владелец пока не указал, что хочет получить.
                                </p>
                            )}
                        </section>

                        {!isOwner && (
                            <section
                                className={Styles.recommendations}
                                aria-label="Подходящие вещи"
                            >
                                <h2>Ваши подходящие вещи</h2>
                                {matchingProducts.length ? (
                                    <>
                                        <div className={Styles.matches}>
                                            {matchingProducts.map((match) => (
                                                <ProductCard
                                                    key={match.product_id}
                                                    title={match.title}
                                                    img={match.image}
                                                    price={match.price}
                                                    location={match.location}
                                                    onClick={() =>
                                                        navigate(`/product/${match.product_id}`)
                                                    }
                                                />
                                            ))}
                                        </div>
                                        {routeChain.length > 1 && (
                                            <Button
                                                variant="text"
                                                onClick={() =>
                                                    navigate(`/route?target=${product.product_id}`)
                                                }
                                            >
                                                Построить маршрут обмена
                                            </Button>
                                        )}
                                    </>
                                ) : routeChain.length > 1 ? (
                                    <div className={Styles.routePreview}>
                                        <p className={Styles.routeHint}>
                                            Прямого обмена нет, но можно дойти через промежуточные
                                            звенья:
                                        </p>
                                        <ChainRow
                                            nodes={routeChain.map((item, index) => ({
                                                product: item,
                                                isCurrent: index === 0,
                                                isGoal: index === routeChain.length - 1,
                                            }))}
                                            onNodeClick={(id) => navigate(`/product/${id}`)}
                                        />
                                        <Button
                                            variant="text"
                                            onClick={() =>
                                                navigate(`/route?target=${product.product_id}`)
                                            }
                                        >
                                            Открыть маршрут
                                        </Button>
                                    </div>
                                ) : (
                                    <div className={Styles.emptyMatch}>
                                        <h3>Прямой обмен пока не складывается</h3>
                                        <p>
                                            Ни одна из ваших вещей не подходит под пожелания
                                            владельца. Можно предложить что-то другое — владелец
                                            решит сам.
                                        </p>
                                        <Button variant="text" onClick={() => setIsOfferOpen(true)}>
                                            Предложить другой товар
                                        </Button>
                                    </div>
                                )}
                            </section>
                        )}
                    </aside>
                </div>
            </div>

            <Modal
                title="Подтвердите действие"
                isOpen={Boolean(confirmAction)}
                onClose={cancelConfirm}
            >
                <div className={Styles.confirm}>
                    <p className={Styles.confirmText}>{confirmText}</p>
                    {actionError && <p className={Styles.actionError}>{actionError}</p>}
                    <div className={Styles.confirmActions}>
                        <Button
                            variant="primary"
                            loading={isActionLoading}
                            disabled={isActionLoading}
                            onClick={confirm}
                        >
                            {confirmLabel}
                        </Button>
                        <Button variant="text" onClick={cancelConfirm} disabled={isActionLoading}>
                            Отмена
                        </Button>
                    </div>
                </div>
            </Modal>
        </MainSection>
    );
};
