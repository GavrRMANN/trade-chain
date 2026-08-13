import { formatVariantCount } from '@features/routeRecommendations';
import { Button } from '@shared/ui/button';
import { MainSection } from '@shared/ui/mainSection';
import { PageError } from '@shared/ui/pageError';
import { PageHeader } from '@shared/ui/pageHeader';
import { Preloader } from '@shared/ui/preloader';
import { ProductFeed, useFeedOwners } from '@widgets/productFeed';

import { useRouteFeed } from '../lib';
import Styles from './route-feed-page.module.css';

/**
 * Подборка следующего шага маршрута, открытая лентой.
 *
 * Тот же список вариантов, что и в блоке «Следующий обмен», но по одной вещи
 * на экран: здесь решают, а не сравнивают. Предложение отсюда уходит сразу в
 * текущую цепочку — отдаваемая вещь известна из этапа маршрута.
 */
export const RouteFeedPage = () => {
    const {
        targetId,
        sourceId,
        targetCategoryName,
        isLoading,
        isError,
        isOwnRoute,
        currentProduct,
        goalProduct,
        products,
        categoryNames,
        offerActions,
        offerExchange,
        openProduct,
        openOwner,
        backToRoute,
        goHome,
    } = useRouteFeed();
    const owners = useFeedOwners();

    if (!targetId || !sourceId) {
        return (
            <MainSection>
                <PageHeader title="Подборка обмена" />
                <div className={Styles['route-feed__notice']}>
                    <h2>Подборка ещё не собрана</h2>
                    <p>Выберите цель и товар, с которого начнёте цепочку.</p>
                    <Button onClick={targetId ? backToRoute : goHome}>
                        {targetId ? 'К маршруту' : 'На главную'}
                    </Button>
                </div>
            </MainSection>
        );
    }

    if (isLoading) {
        return <Preloader message="Подбираем следующий обмен…" />;
    }

    if (isError) {
        return <PageError message="Не удалось загрузить подборку" />;
    }

    /* Подборка персональная: её считают от вещи, которая сейчас на руках у
       пользователя. Ссылку можно переслать, поэтому чужой аккаунт упирается
       здесь — маршрут защищён не только адресом, но и данными владельца. */
    if (!isOwnRoute) {
        return (
            <MainSection>
                <PageHeader title="Подборка обмена" />
                <div className={Styles['route-feed__notice']}>
                    <h2>Подборка недоступна</h2>
                    <p>
                        Она собрана под чужой маршрут: варианты зависят от вещи, которая сейчас на
                        руках у его владельца. Постройте свой путь к цели — подборка будет своя.
                    </p>
                    <Button onClick={goHome}>На главную</Button>
                </div>
            </MainSection>
        );
    }

    const goalTitle = goalProduct ? goalProduct.title : (targetCategoryName ?? 'категория');
    const hasFeed = products.length > 0;

    return (
        <MainSection>
            {/* На телефоне лента полноэкранная — обычная шапка страницы
                встала бы над карточкой лишним блоком текста и кнопкой на
                всю ширину. Контекст там несёт компактная плашка поверх
                фото, той же полупрозрачной подложкой, что и у самой
                карточки; шапка страницы остаётся только под desktop. */}
            <div
                className={[Styles['route-feed__header'], hasFeed && Styles['route-feed__header--feed']]
                    .filter(Boolean)
                    .join(' ')}
            >
                <PageHeader
                    title="Подборка обмена"
                    meta={
                        <>
                            <strong>Цель: {goalTitle}</strong>
                            {currentProduct && <span>Отдаёте: {currentProduct.title}</span>}
                            {hasFeed && <span>{formatVariantCount(products.length)}</span>}
                        </>
                    }
                    compactActions
                    actions={
                        <Button variant="secondary" onClick={backToRoute}>
                            К маршруту
                        </Button>
                    }
                />
            </div>

            {!hasFeed ? (
                <div className={Styles['route-feed__notice']}>
                    <h2>Подходящих вариантов пока нет</h2>
                    <p>Подборка пересчитается, когда появятся новые товары.</p>
                    <Button onClick={backToRoute}>К маршруту</Button>
                </div>
            ) : (
                <div className={Styles['route-feed__body']}>
                    <div className={Styles['route-feed__mobile-bar']}>
                        <button
                            type="button"
                            className={Styles['route-feed__mobile-back']}
                            onClick={backToRoute}
                            aria-label="Вернуться к маршруту"
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M15 6l-6 6 6 6" />
                            </svg>
                        </button>
                        <div className={Styles['route-feed__mobile-goal']}>
                            <span className={Styles['route-feed__mobile-goal-label']}>Цель</span>
                            <strong className={Styles['route-feed__mobile-goal-title']}>
                                {goalTitle}
                            </strong>
                        </div>
                        <span className={Styles['route-feed__mobile-count']}>
                            {formatVariantCount(products.length)}
                        </span>
                    </div>

                    {/* Цепочку строить не из чего — пользователь уже внутри
                        неё, поэтому у карточки остаётся одно главное действие. */}
                    <ProductFeed
                        products={products}
                        categoryNames={categoryNames}
                        owners={owners}
                        offerActions={offerActions}
                        onOpenProduct={openProduct}
                        onOpenOwner={openOwner}
                        onOfferExchange={offerExchange}
                    />
                </div>
            )}
        </MainSection>
    );
};
