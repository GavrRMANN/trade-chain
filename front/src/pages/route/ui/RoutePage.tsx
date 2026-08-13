import { RouteRecommendations } from '@features/routeRecommendations';
import { Button } from '@shared/ui/button';
import { MainSection } from '@shared/ui/mainSection';
import { PageError } from '@shared/ui/pageError';
import { PageHeader } from '@shared/ui/pageHeader';
import { Preloader } from '@shared/ui/preloader';
import { ProductImage } from '@entities/product';
import { ProfileProductRow } from '@widgets/profile';
import { formatDate } from '@shared/lib';

import { formatCompletedCount, formatExchangeCount, useRoute } from '../lib';
import { RouteTrack } from './RouteTrack';
import Styles from './route-page.module.css';

export const RoutePage = () => {
    const {
        targetId,
        sourceId,
        targetCategoryName,
        isLoading,
        isError,
        isEmpty,
        sourceProducts,
        selectSource,
        currentProduct,
        goalProduct,
        stepsRemaining,
        recommendations,
        previewRecommendations,
        selectedTargetIds,
        history,
        submitError,
        submitMessage,
        isSubmitting,
        toggleRecommendation,
        submitSelectedOffers,
        openProduct,
        openOffer,
        openGoalOffer,
        openRecommendationsFeed,
        goHome,
    } = useRoute();

    if (!targetId) {
        return (
            <MainSection>
                <PageHeader title="Путь к цели" />
                <div className={Styles['route-page__empty']}>
                    <h2>Цель не выбрана</h2>
                    <p>Выберите желаемый товар, чтобы построить маршрут обмена.</p>
                    <Button onClick={goHome}>На главную</Button>
                </div>
            </MainSection>
        );
    }

    if (isLoading) {
        return <Preloader message="Подбираем следующий обмен…" />;
    }

    if (isError) {
        return <PageError message="Не удалось построить путь к цели" />;
    }

    if (!sourceId) {
        return (
            <MainSection>
                <PageHeader
                    title="Путь к цели"
                    subTitle="Шаг 1 из 2: выберите товар, с которого начнёте цепочку"
                />
                <div className={Styles['route-page__source-picker']}>
                    <div>
                        <h2>С чего начинаем?</h2>
                        <p>Выберите своё активное объявление, которое хотите обменять по цепочке на целевой товар.</p>
                    </div>
                    {sourceProducts.length ? (
                        <div className={Styles['route-page__source-list']}>
                            {sourceProducts.map((source) => (
                                <ProfileProductRow
                                    key={source.product_id}
                                    product={source}
                                    isOwner={false}
                                    onOpen={() => selectSource(source.product_id)}
                                    onEdit={() => undefined}
                                    openLabel="Выбрать"
                                />
                            ))}
                        </div>
                    ) : (
                        <p>У вас нет активных объявлений для начала цепочки.</p>
                    )}
                </div>
            </MainSection>
        );
    }

    return (
        <MainSection>
            {/* Цель и остаток шагов — то, ради чего открыт экран: они должны
                оставаться на виду, пока пользователь листает рекомендации.
                Действия здесь нет: цель открывается со своей плитки в паре
                ниже, и ссылка в шапке была бы вторым входом в то же место. */}
            <PageHeader
                title="Путь к цели"
                meta={
                    <>
                        <strong>
                            {goalProduct
                                ? `Цель: ${goalProduct.title}`
                                : `Категория: ${targetCategoryName ?? 'категория'}`}
                        </strong>
                        {goalProduct && (
                            <span>
                                {stepsRemaining === 0
                                    ? 'Цель достигнута'
                                    : `${formatExchangeCount(stepsRemaining)} до цели`}
                            </span>
                        )}
                    </>
                }
            />

            <div className={Styles['route-page']}>
                {isEmpty || !currentProduct ? (
                    <div className={Styles['route-page__empty']}>
                        <h2>Подходящий путь пока не найден</h2>
                        <p>Не удалось определить исходный товар для маршрута.</p>
                        {goalProduct && <Button onClick={openGoalOffer}>Предложить прямой обмен</Button>}
                    </div>
                ) : (
                    <>
                        {/* Пара «сейчас у вас → цель» стоит выше подборки: сначала
                            видно, что уходит и ради чего, и только потом — на что
                            это менять. */}
                        <RouteTrack
                            currentProduct={currentProduct}
                            goalProduct={goalProduct}
                            categoryName={targetCategoryName}
                            stepsRemaining={stepsRemaining}
                            onOpenProduct={openProduct}
                        />

                        {!goalProduct || stepsRemaining > 0 ? (
                            <section
                                className={Styles['route-page__recommendations']}
                                aria-labelledby="route-recommendations-title"
                            >
                                <div className={Styles['route-page__section-heading']}>
                                    <h2 id="route-recommendations-title">Следующий обмен</h2>
                                    <p>
                                        Отметьте подходящие варианты — каждое предложение уходит
                                        отдельно
                                    </p>
                                </div>

                                {/* Подборка целиком живёт лентой: на странице видно
                                    только начало ряда, а вход в неё стоит у самих
                                    карточек — открытая оттуда лента считает тот же
                                    этап маршрута, поэтому предложение уходит в
                                    текущую цепочку, а не отдельным обменом. */}
                                <RouteRecommendations
                                    items={previewRecommendations}
                                    hiddenCount={
                                        recommendations.length - previewRecommendations.length
                                    }
                                    onOpenFeed={openRecommendationsFeed}
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

                        {/* Пустая история — это ещё не факт о маршруте, а его
                            отсутствие: на только что начатом пути целый раздел с
                            заглушкой отодвигал бы вниз всё остальное. */}
                        {history.length > 0 && (
                            <section
                                className={Styles['route-page__history']}
                                aria-labelledby="route-history-title"
                            >
                                <div className={Styles['route-page__history-heading']}>
                                    <h2 id="route-history-title">История пути</h2>
                                    <span>{formatCompletedCount(history.length)}</span>
                                </div>

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
                            </section>
                        )}
                    </>
                )}
            </div>
        </MainSection>
    );
};
