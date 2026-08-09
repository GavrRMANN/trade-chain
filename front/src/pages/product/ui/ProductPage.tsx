import {useLayoutEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import {usePageTitle} from '@app/providers/pageTitle';
import {OfferExchangeModal} from '@features/exchange';
import {WishlistEditor} from '@features/wishlist';
import {Button} from '@shared/ui/button';
import {ChainRow} from '@shared/ui/chainRow';
import {ExchangeRow} from '@shared/ui/exchangeRow';
import {MainSection} from '@shared/ui/mainSection';
import {Modal} from '@shared/ui/modal';
import {PageError} from '@shared/ui/pageError';
import {Preloader} from '@shared/ui/preloader';
import {ProductCard} from '@shared/ui/productCard';
import {ProductImage} from '@shared/ui/productImage';
import {Rating} from '@shared/ui/rating';
import {SellerInfo} from '@shared/ui/sellerInfo';
import {formatAmount, formatDate, useOpenModalRoute} from '@shared/lib';
import {useProductActions, useProductPageData} from '../lib';

import Styles from './product-page.module.css';

const statusLabels = {
    active: 'Активен',
    reserved: 'Зарезервирован',
    exchanged: 'Обменян',
    archived: 'В архиве',
} as const;

export const ProductPage = () => {
    const {productId} = useParams<{productId: string}>();
    const navigate = useNavigate();
    const openModalRoute = useOpenModalRoute();
    const {setTitle} = usePageTitle();
    const [isOfferOpen, setIsOfferOpen] = useState(false);

    const {
        product,
        customer,
        category,
        wishlist,
        wishlistOptions,
        matchingProducts,
        routeChain,
        reviews,
        averageRating,
        incomingOffers,
        productOffers,
        isOwner,
        isAuthenticated,
        currentUserId,
        isLoading,
        isError,
    } = useProductPageData(productId);

    const {
        status: actionStatus,
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
        setTitle('');
    }, [setTitle]);

    if (isLoading) return <Preloader />;
    if (isError || !product) return <PageError message="Не удалось загрузить товар" />;

    const status = actionStatus ?? product.status;
    const sellerName = customer?.email || 'Email не указан';
    const hasRating = typeof averageRating === 'number' && averageRating > 0;
    const ratingText = hasRating
        ? `${averageRating.toFixed(1)} · Отзывов: ${reviews.length}`
        : reviews.length
            ? `Отзывов: ${reviews.length}`
            : 'Пока без отзывов';
    const canOffer = status === 'active' && !isOwner && isAuthenticated;

    const openOffer = () => {
        if (!isAuthenticated) {
            openModalRoute('auth');
            return;
        }
        if (status === 'active') setIsOfferOpen(true);
    };

    return (
        <MainSection>
            <article className={Styles['product-page']}>
                <header className={Styles['product-page__header']}>
                    <h1>{product.title}</h1>
                    <div className={Styles['product-page__meta']}>
                        <strong className={Styles['product-page__price']}>
                            {product.price !== undefined ? formatAmount(product.price) : 'Цена не указана'}
                        </strong>
                        <span className={Styles['product-page__status']}>{statusLabels[status]}</span>
                        {product.location && <span>{product.location}</span>}
                    </div>
                </header>

                <div className={Styles['product-page__hero']}>
                    <div className={Styles['product-page__main']}>
                        <div className={Styles['product-page__overview']}>
                            <div className={Styles['product-page__media']}>
                                <ProductImage src={product.image} alt={product.title} title={product.title} />
                            </div>
                            <div className={Styles['product-page__details']}>
                                <section className={Styles['product-page__section']}>
                                    <h2>О товаре</h2>
                                    <dl className={Styles['product-page__facts']}>
                                        <div><dt>Категория</dt><dd>{category?.name || 'Не указана'}</dd></div>
                                        <div><dt>Статус</dt><dd>{statusLabels[status]}</dd></div>
                                        <div><dt>Город</dt><dd>{product.location || 'Не указан'}</dd></div>
                                    </dl>
                                </section>
                                <dl className={Styles['product-page__dates']}>
                                    <div><dt>Размещено</dt><dd>{formatDate(product.created_at, 'long')}</dd></div>
                                    <div><dt>Обновлено</dt><dd>{formatDate(product.updated_at, 'long')}</dd></div>
                                </dl>
                            </div>
                        </div>

                        <section className={`${Styles['product-page__section']} ${Styles['product-page__description']}`}>
                            <h2>Описание</h2>
                            <p>{product.description || 'Владелец пока не добавил описание.'}</p>
                        </section>

                        {isOwner && (
                            <section className={Styles['product-page__wide-section']}>
                                <div className={Styles['product-page__section-heading']}>
                                    <div><h2>Предложения по этому товару</h2><p>Все цепочки, в которых ваш товар указан целью обмена.</p></div>
                                    <Button variant="text" onClick={() => navigate('/exchanges')}>Все предложения</Button>
                                </div>
                                {productOffers.length ? (
                                    <div className={Styles['product-page__offers']}>
                                        {productOffers.slice(0, 3).map((row) => (
                                            <ExchangeRow key={row.chain.chain_id} row={row} onOpen={(chainId) => navigate(`/exchanges/${chainId}`)} />
                                        ))}
                                    </div>
                                ) : <div className={Styles['product-page__empty']}>Пока никто не предложил обмен на этот товар.</div>}
                            </section>
                        )}
                    </div>

                    <aside className={Styles['product-page__aside']}>
                        <section className={Styles['product-page__panel']}>
                            <h2>{isOwner ? 'Управление объявлением' : 'Обмен'}</h2>
                            {isOwner ? (
                                <div className={Styles['product-page__actions']}>
                                    <Button variant="secondary" onClick={() => navigate(`/product/${product.product_id}/edit`)}>
                                        Редактировать
                                    </Button>
                                    {status === 'active' ? (
                                        <Button variant="secondary" onClick={requestArchive}>Снять с обмена</Button>
                                    ) : (
                                        <p className={Styles['product-page__muted']}>Товар больше не участвует в новых обменах.</p>
                                    )}
                                    <div className={Styles['product-page__offer-summary']}>
                                        <span>Активных предложений</span>
                                        <strong>{incomingOffers}</strong>
                                        <Button variant="text" onClick={() => navigate('/exchanges')}>Смотреть предложения</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className={Styles['product-page__actions']}>
                                    <Button onClick={openOffer} disabled={isAuthenticated && !canOffer}>
                                        {isAuthenticated ? 'Предложить обмен' : 'Войти, чтобы предложить обмен'}
                                    </Button>
                                    {status !== 'active' && (
                                        <p className={Styles['product-page__muted']}>Владелец временно не принимает новые предложения.</p>
                                    )}
                                </div>
                            )}
                        </section>

                        <section className={Styles['product-page__panel']}>
                            <h2>{isOwner ? 'Ваш профиль' : 'Продавец'}</h2>
                            {hasRating && <Rating value={averageRating ?? 0} />}
                            <SellerInfo name={sellerName} meta={ratingText} profileId={product.customer_id} />
                        </section>

                        <section className={Styles['product-page__panel']}>
                            {isOwner ? (
                                <WishlistEditor productId={product.product_id} productTitle={product.title} wishlist={wishlist} options={wishlistOptions} />
                            ) : (
                                <>
                                    <h2>Хочу взамен</h2>
                                    {wishlistOptions.length ? (
                                        <>
                                            <p className={Styles['product-page__wishlist-label']}>Интересуют следующие категории:</p>
                                            <div className={Styles['product-page__wishlist']}>
                                                {wishlistOptions.map((option) => <span key={option.category_id}>{option.name}</span>)}
                                            </div>
                                        </>
                                    ) : (
                                        <p className={Styles['product-page__muted']}>Владелец не указал желаемые категории — можно предложить любой свой товар.</p>
                                    )}
                                </>
                            )}
                        </section>

                        {!isOwner && isAuthenticated && (
                            <section className={Styles['product-page__panel']}>
                                <h2>Ваши варианты обмена</h2>
                                {matchingProducts.length ? (
                                    <>
                                        <p className={Styles['product-page__muted']}>Эти вещи совпадают с пожеланиями владельца.</p>
                                        <div className={Styles['product-page__matches']}>
                                            {matchingProducts.slice(0, 2).map((match) => (
                                                <ProductCard key={match.product_id} title={match.title} img={match.image} price={match.price} location={match.location} onClick={openOffer} />
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p className={Styles['product-page__muted']}>Прямого совпадения нет, но владелец может принять другое предложение.</p>
                                )}
                                {routeChain.length > 1 && (
                                    <div className={Styles['product-page__route']}>
                                        <h3>Маршрут через цепочку</h3>
                                        <ChainRow
                                            nodes={routeChain.map((item, index) => ({product: item, isCurrent: index === 0, isGoal: index === routeChain.length - 1}))}
                                            onNodeClick={(id) => navigate(`/product/${id}`)}
                                        />
                                        <Button variant="text" onClick={() => navigate(`/route?target=${product.product_id}`)}>Открыть маршрут обмена</Button>
                                    </div>
                                )}
                            </section>
                        )}
                    </aside>
                </div>

            </article>

            <OfferExchangeModal
                isOpen={isOfferOpen && canOffer}
                onClose={() => setIsOfferOpen(false)}
                onSuccess={(chainId) => navigate(`/exchanges/${chainId}`)}
                targetProductId={product.product_id}
                currentCustomerId={currentUserId}
            />

            <Modal title="Подтвердите действие" isOpen={confirmAction} onClose={cancelConfirm}>
                <div className={Styles['product-page__confirm']}>
                    <p>{confirmText}</p>
                    {actionError && <p className={Styles['product-page__error']}>{actionError}</p>}
                    <div className={Styles['product-page__confirm-actions']}>
                        <Button loading={isActionLoading} disabled={isActionLoading} onClick={confirm}>{confirmLabel}</Button>
                        <Button variant="text" onClick={cancelConfirm} disabled={isActionLoading}>Отмена</Button>
                    </div>
                </div>
            </Modal>
        </MainSection>
    );
};
