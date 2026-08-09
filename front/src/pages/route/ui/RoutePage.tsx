import { OfferExchangeModal } from '@features/exchange';
import { RouteRecommendations } from '@features/routeRecommendations';
import { Button } from '@shared/ui/button';
import { MainSection } from '@shared/ui/mainSection';
import { PageError } from '@shared/ui/pageError';
import { Preloader } from '@shared/ui/preloader';
import { ProductImage } from '@shared/ui/productImage';
import { formatAmount, formatDate } from '@shared/lib';

import { useRoute } from '../lib';
import Styles from './route-page.module.css';

const formatExchangeCount = (count: number): string => {
    const lastTwo = count % 100;
    const last = count % 10;
    const word =
        lastTwo >= 11 && lastTwo <= 14
            ? 'обменов'
            : last === 1
              ? 'обмен'
              : last >= 2 && last <= 4
                ? 'обмена'
                : 'обменов';
    return `${count} ${word}`;
};

const formatCompletedCount = (count: number): string => {
    const lastTwo = count % 100;
    const last = count % 10;
    const words =
        lastTwo >= 11 && lastTwo <= 14
            ? 'завершённых обменов'
            : last === 1
              ? 'завершённый обмен'
              : last >= 2 && last <= 4
                ? 'завершённых обмена'
                : 'завершённых обменов';
    return `${count} ${words}`;
};

export const RoutePage = () => {
    const {
        targetId,
        isAuthenticated,
        isLoading,
        isError,
        isEmpty,
        currentCustomerId,
        currentProduct,
        goalProduct,
        stepsRemaining,
        recommendations,
        selectedTargetIds,
        history,
        submitError,
        submitMessage,
        isSubmitting,
        directTarget,
        toggleRecommendation,
        submitSelectedOffers,
        openProduct,
        openOffer,
        openGoalOffer,
        closeOffer,
        handleOfferSuccess,
        goHome,
        openAuthModal,
    } = useRoute();

    if (!targetId) {
        return (
            <MainSection>
                <div className={Styles['route-page__empty']}>
                    <h2>Цель не выбрана</h2>
                    <p>Выберите желаемый товар, чтобы построить маршрут обмена.</p>
                    <Button onClick={goHome}>На главную</Button>
                </div>
            </MainSection>
        );
    }

    if (!isAuthenticated) {
        return (
            <MainSection>
                <section className={Styles['route-page__guest-card']}>
                    <div>
                        <h2>Войдите, чтобы построить путь к цели</h2>
                        <p>
                            Сервис покажет ближайший обмен и будет пересчитывать путь после каждого
                            шага.
                        </p>
                    </div>
                    <Button onClick={openAuthModal}>Войти или зарегистрироваться</Button>
                </section>
            </MainSection>
        );
    }

    if (isLoading) {
        return <Preloader message="Подбираем следующий обмен…" />;
    }

    if (isError) {
        return <PageError message="Не удалось построить путь к цели" />;
    }

    return (
        <MainSection>
            <div className={Styles['route-page']}>
                {isEmpty || !currentProduct || !goalProduct ? (
                    <div className={Styles['route-page__empty']}>
                        <h2>Подходящий путь пока не найден</h2>
                        <p>Можно предложить свой товар владельцу цели напрямую.</p>
                        <Button onClick={openGoalOffer}>Предложить прямой обмен</Button>
                    </div>
                ) : (
                    <>
                        <section
                            className={Styles['route-page__goal']}
                            aria-labelledby="route-goal-title"
                        >
                            <div className={Styles['route-page__goal-media']}>
                                <ProductImage
                                    src={goalProduct.image}
                                    alt={goalProduct.title}
                                    title={goalProduct.title}
                                />
                            </div>
                            <div className={Styles['route-page__goal-body']}>
                                <h2 id="route-goal-title">Цель: {goalProduct.title}</h2>
                                <p>
                                    {stepsRemaining === 0
                                        ? 'Цель достигнута'
                                        : `${formatExchangeCount(stepsRemaining)} до цели`}
                                </p>
                            </div>
                            <Button
                                variant="text"
                                className={Styles['route-page__goal-action']}
                                onClick={() => openProduct(goalProduct.product_id)}
                            >
                                Открыть цель
                            </Button>
                        </section>

                        {stepsRemaining > 0 ? (
                            <section
                                className={Styles['route-page__recommendations']}
                                aria-labelledby="route-recommendations-title"
                            >
                                <div className={Styles['route-page__section-heading']}>
                                    <div>
                                        <h2 id="route-recommendations-title">Следующий обмен</h2>
                                        <p>Выберите один или несколько вариантов</p>
                                    </div>
                                    <span>Предложения отправляются независимо</span>
                                </div>

                                <RouteRecommendations
                                    items={recommendations}
                                    selectedIds={selectedTargetIds}
                                    isSubmitting={isSubmitting}
                                    onToggle={toggleRecommendation}
                                    onSubmit={submitSelectedOffers}
                                    onOpenProduct={openProduct}
                                    onOpenOffer={openOffer}
                                />

                                {submitMessage && (
                                    <p
                                        className={Styles['route-page__feedback--success']}
                                        role="status"
                                    >
                                        {submitMessage}
                                    </p>
                                )}
                                {submitError && (
                                    <p
                                        className={Styles['route-page__feedback--error']}
                                        role="alert"
                                    >
                                        {submitError}
                                    </p>
                                )}
                            </section>
                        ) : (
                            <section className={Styles['route-page__complete']}>
                                <span aria-hidden="true">✓</span>
                                <div>
                                    <h2>Вы достигли цели</h2>
                                    <p>
                                        Маршрут завершён, а все предыдущие этапы сохранены в
                                        истории.
                                    </p>
                                </div>
                            </section>
                        )}

                        <section
                            className={Styles['route-page__current']}
                            aria-labelledby="route-current-title"
                        >
                            <div className={Styles['route-page__current-media']}>
                                <ProductImage
                                    src={currentProduct.image}
                                    alt={currentProduct.title}
                                    title={currentProduct.title}
                                />
                            </div>
                            <div className={Styles['route-page__current-body']}>
                                <span>Сейчас у вас</span>
                                <h2 id="route-current-title">{currentProduct.title}</h2>
                                <div>
                                    <strong>
                                        {currentProduct.price === undefined
                                            ? 'Цена не указана'
                                            : formatAmount(currentProduct.price)}
                                    </strong>
                                    <span>{currentProduct.location ?? 'Город не указан'}</span>
                                </div>
                            </div>
                            <Button
                                variant="text"
                                className={Styles['route-page__current-action']}
                                onClick={() => openProduct(currentProduct.product_id)}
                            >
                                Открыть товар
                            </Button>
                        </section>

                        <section
                            className={Styles['route-page__history']}
                            aria-labelledby="route-history-title"
                        >
                            <div className={Styles['route-page__history-heading']}>
                                <h2 id="route-history-title">История пути</h2>
                                <span>{formatCompletedCount(history.length)}</span>
                            </div>

                            {history.length === 0 ? (
                                <p className={Styles['route-page__history-empty']}>
                                    Здесь появятся товары после завершённых обменов.
                                </p>
                            ) : (
                                <ul className={Styles['route-page__history-list']}>
                                    {history.map(({ chain, product }) => (
                                        <li key={chain.chain_id}>
                                            <span
                                                className={Styles['route-page__history-check']}
                                                aria-hidden="true"
                                            >
                                                ✓
                                            </span>
                                            {product && (
                                                <div
                                                    className={Styles['route-page__history-media']}
                                                >
                                                    <ProductImage
                                                        src={product.image}
                                                        alt={product.title}
                                                        title={product.title}
                                                    />
                                                </div>
                                            )}
                                            <div className={Styles['route-page__history-body']}>
                                                <strong>
                                                    {product?.title ?? 'Предыдущий товар'}
                                                </strong>
                                                <span>
                                                    Обмен завершён {formatDate(chain.updated_at)}
                                                </span>
                                            </div>
                                            <Button
                                                variant="text"
                                                onClick={() => openOffer(chain.chain_id)}
                                                ariaLabel="Открыть завершённый обмен"
                                            >
                                                Подробнее
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </>
                )}
            </div>

            <OfferExchangeModal
                isOpen={Boolean(directTarget)}
                onClose={closeOffer}
                onSuccess={handleOfferSuccess}
                targetProductId={directTarget ?? ''}
                currentCustomerId={currentCustomerId}
            />
        </MainSection>
    );
};
