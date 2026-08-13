import { OfferExchangeModal } from '@features/exchange';
import { WishlistEditor } from '@features/wishlist';
import { Button } from '@shared/ui/button';
import { ChainRow } from '@widgets/chainRow';
import { ExchangeRow } from '@widgets/exchangeRow';
import { MainSection } from '@shared/ui/mainSection';
import { Modal } from '@shared/ui/modal';
import { PageError } from '@shared/ui/pageError';
import { PageHeader } from '@shared/ui/pageHeader';
import { Preloader } from '@shared/ui/preloader';
import { ProductCard, ProductImage } from '@entities/product';
import { SellerInfo } from '@widgets/sellerInfo';
import { formatAmount, formatDate } from '@shared/lib';

import { useProductPage } from '../lib';

import { ArchivedProductView } from './ArchivedProductView';
import Styles from './product-page.module.css';

export const ProductPage = () => {
    const {
        product,
        category,
        wishlist,
        wishlistOptions,
        matchingProducts,
        routeChain,
        averageRating,
        incomingOffers,
        productOffers,
        myProductOffers,
        targetChain,
        isOwner,
        isAuthenticated,
        currentUserId,
        isLoading,
        isError,
        status,
        statusLabels,
        sellerName,
        hasRating,
        ratingText,
        canOffer,
        needsOwnProductToOffer,
        isOfferOpen,
        openOffer,
        closeOffer,
        onOfferSuccess,
        requestArchive,
        cancelConfirm,
        confirm,
        confirmAction,
        confirmText,
        confirmLabel,
        isActionLoading,
        actionError,
        openProduct,
        openEditProduct,
        openExchanges,
        openIncomingOffers,
        openCreateForTarget,
        openRoute,
        openExchangeRoom,
    } = useProductPage();

    if (isLoading) return <Preloader />;
    if (isError || !product) return <PageError message="Не удалось загрузить товар" />;

    if (status === 'archived') {
        return (
            <ArchivedProductView
                product={product}
                category={category}
                wishlistOptions={wishlistOptions}
                sellerName={sellerName}
                averageRating={averageRating}
                hasRating={hasRating}
                ratingText={ratingText}
            />
        );
    }

    return (
        <MainSection>
            {/* Название, цена и главное действие остаются на виду всю прокрутку:
                страница длинная, а решение «обменять или нет» принимается по
                этим трём вещам. */}
            <PageHeader
                title={product.title}
                meta={
                    <>
                        <strong className={Styles['product-page__price']}>
                            {product.price !== undefined
                                ? formatAmount(product.price)
                                : 'Цена не указана'}
                        </strong>
                        <span className={Styles['product-page__status']}>
                            {statusLabels[status]}
                        </span>
                        {product.location && <span>{product.location}</span>}
                    </>
                }
                actions={
                    isOwner ? (
                        <Button
                            variant="secondary"
                            onClick={() => openEditProduct(product.product_id)}
                        >
                            Редактировать
                        </Button>
                    ) : (
                        /* Пустой профиль ведёт в то же предложение: описать вещь
                           можно прямо там, не теряя выбранный товар. */
                        <Button onClick={openOffer} disabled={isAuthenticated && !canOffer}>
                            {isAuthenticated ? 'Предложить обмен' : 'Войти, чтобы предложить'}
                        </Button>
                    )
                }
            />

            <article className={Styles['product-page']}>
                <div className={Styles['product-page__hero']}>
                    <div className={Styles['product-page__main']}>
                        <div className={Styles['product-page__overview']}>
                            <div className={Styles['product-page__media']}>
                                <ProductImage
                                    src={product.image}
                                    alt={product.title}
                                    title={product.title}
                                />
                            </div>
                            <div className={Styles['product-page__details']}>
                                <section className={Styles['product-page__section']}>
                                    <h2>О товаре</h2>
                                    <dl className={Styles['product-page__facts']}>
                                        <div>
                                            <dt>Категория</dt>
                                            <dd>{category?.name || 'Не указана'}</dd>
                                        </div>
                                        <div>
                                            <dt>Статус</dt>
                                            <dd>{statusLabels[status]}</dd>
                                        </div>
                                        <div>
                                            <dt>Город</dt>
                                            <dd>{product.location || 'Не указан'}</dd>
                                        </div>
                                    </dl>
                                </section>
                                <dl className={Styles['product-page__dates']}>
                                    <div>
                                        <dt>Размещено</dt>
                                        <dd>{formatDate(product.created_at, 'long')}</dd>
                                    </div>
                                    <div>
                                        <dt>Обновлено</dt>
                                        <dd>{formatDate(product.updated_at, 'long')}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        <section
                            className={`${Styles['product-page__section']} ${Styles['product-page__description']}`}
                        >
                            <h2>Описание</h2>
                            <p>{product.description || 'Владелец пока не добавил описание.'}</p>
                        </section>

                        {!isOwner && isAuthenticated && (
                            <section className={Styles['product-page__wide-section']}>
                                <div className={Styles['product-page__section-heading']}>
                                    <div>
                                        <h2>Ваши варианты обмена</h2>
                                        <p>Эти вещи совпадают с пожеланиями владельца.</p>
                                    </div>
                                </div>
                                {matchingProducts.length ? (
                                    <div className={Styles['product-page__matches']}>
                                        {matchingProducts.slice(0, 2).map((match) => (
                                            <ProductCard
                                                key={match.product_id}
                                                title={match.title}
                                                img={match.image}
                                                price={match.price}
                                                location={match.location}
                                                onClick={openOffer}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className={Styles['product-page__muted']}>
                                        Прямого совпадения нет, но владелец может принять другое
                                        предложение.
                                    </p>
                                )}
                                {routeChain.length > 1 && (
                                    <div className={Styles['product-page__route']}>
                                        <h3>Маршрут через цепочку</h3>
                                        <ChainRow
                                            nodes={routeChain.map((item, index) => ({
                                                product: item,
                                                isCurrent: index === 0,
                                                isGoal: index === routeChain.length - 1,
                                            }))}
                                            onNodeClick={openProduct}
                                        />
                                        <Button
                                            variant="text"
                                            onClick={() => openRoute(product.product_id)}
                                        >
                                            Открыть маршрут обмена
                                        </Button>
                                    </div>
                                )}
                            </section>
                        )}

                        {!isOwner && myProductOffers.length > 0 && (
                            <section className={Styles['product-page__wide-section']}>
                                <div className={Styles['product-page__section-heading']}>
                                    <div>
                                        <h2>Ваши предложения по этому товару</h2>
                                        <p>Активные обмены, в которых участвует этот товар.</p>
                                    </div>
                                    <Button variant="text" onClick={openExchanges}>
                                        Все обмены
                                    </Button>
                                </div>
                                <div className={Styles['product-page__offers']}>
                                    {myProductOffers.slice(0, 3).map((row) => (
                                        <ExchangeRow
                                            key={row.chain.chain_id}
                                            row={row}
                                            onOpen={openExchangeRoom}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {isOwner && (
                            <section className={Styles['product-page__wide-section']}>
                                <div className={Styles['product-page__section-heading']}>
                                    <div>
                                        <h2>Предложения по этому товару</h2>
                                        <p>Все цепочки, в которых ваш товар указан целью обмена.</p>
                                    </div>
                                    <Button variant="text" onClick={openIncomingOffers}>
                                        Все предложения
                                    </Button>
                                </div>
                                {productOffers.length ? (
                                    <div className={Styles['product-page__offers']}>
                                        {productOffers.slice(0, 3).map((row) => (
                                            <ExchangeRow
                                                key={row.chain.chain_id}
                                                row={row}
                                                onOpen={openExchangeRoom}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className={Styles['product-page__empty']}>
                                        Пока никто не предложил обмен на этот товар.
                                    </div>
                                )}
                            </section>
                        )}
                    </div>

                    <aside className={Styles['product-page__aside']}>
                        <section className={Styles['product-page__panel']}>
                            <h2>{isOwner ? 'Управление объявлением' : 'Обмен'}</h2>
                            {isOwner ? (
                                <div className={Styles['product-page__actions']}>
                                    {status === 'active' ? (
                                        <Button variant="secondary" onClick={requestArchive}>
                                            Снять с обмена
                                        </Button>
                                    ) : (
                                        <p className={Styles['product-page__muted']}>
                                            Товар больше не участвует в новых обменах.
                                        </p>
                                    )}
                                    <div className={Styles['product-page__offer-summary']}>
                                        <span>Активных предложений</span>
                                        <strong>{incomingOffers}</strong>
                                        <Button variant="text" onClick={openIncomingOffers}>
                                            Смотреть предложения
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className={Styles['product-page__actions']}>
                                    {isAuthenticated && targetChain ? (
                                        <Button
                                            variant="secondary"
                                            onClick={() =>
                                                openRoute(
                                                    product.product_id,
                                                    targetChain.from_product_id,
                                                )
                                            }
                                        >
                                            К цепочке
                                        </Button>
                                    ) : (
                                        canOffer && (
                                            <Button
                                                variant="secondary"
                                                onClick={() => openRoute(product.product_id)}
                                            >
                                                Построить цепочку обменов
                                            </Button>
                                        )
                                    )}
                                    {needsOwnProductToOffer && (
                                        <p className={Styles['product-page__muted']}>
                                            Активных объявлений пока нет — вещь можно описать прямо
                                            в форме предложения.
                                        </p>
                                    )}
                                    {status !== 'active' && (
                                        <p className={Styles['product-page__muted']}>
                                            Владелец временно не принимает новые предложения.
                                        </p>
                                    )}
                                </div>
                            )}
                        </section>

                        <section className={Styles['product-page__panel']}>
                            <h2>{isOwner ? 'Ваш профиль' : 'Продавец'}</h2>
                            <SellerInfo
                                name={sellerName}
                                meta={ratingText}
                                rating={averageRating}
                                hasRating={hasRating}
                                profileId={product.customer_id}
                            />
                        </section>

                        <section className={Styles['product-page__panel']}>
                            {isOwner ? (
                                <WishlistEditor
                                    productId={product.product_id}
                                    productTitle={product.title}
                                    wishlist={wishlist}
                                    options={wishlistOptions}
                                />
                            ) : (
                                <>
                                    <h2>Хочу взамен</h2>
                                    {wishlistOptions.length ? (
                                        <>
                                            <p className={Styles['product-page__wishlist-label']}>
                                                Интересуют следующие категории:
                                            </p>
                                            <div className={Styles['product-page__wishlist']}>
                                                {wishlistOptions.map((option) => (
                                                    <span key={option.category_id}>
                                                        {option.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <p className={Styles['product-page__muted']}>
                                            Владелец не указал желаемые категории — можно предложить
                                            любой свой товар.
                                        </p>
                                    )}
                                </>
                            )}
                        </section>
                    </aside>
                </div>
            </article>

            <OfferExchangeModal
                isOpen={isOfferOpen && canOffer}
                onClose={closeOffer}
                onSuccess={onOfferSuccess}
                targetProductId={product.product_id}
                currentCustomerId={currentUserId}
                onCreateFullProduct={openCreateForTarget}
            />

            <Modal title="Подтвердите действие" isOpen={confirmAction} onClose={cancelConfirm}>
                <div className={Styles['product-page__confirm']}>
                    <p>{confirmText}</p>
                    {actionError && <p className={Styles['product-page__error']}>{actionError}</p>}
                    <div className={Styles['product-page__confirm-actions']}>
                        <Button
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
