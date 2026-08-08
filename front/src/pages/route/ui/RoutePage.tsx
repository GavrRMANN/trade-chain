import Styles from './route-page.module.css';
import { MainSection } from '@shared/ui/mainSection';
import { ChainRow } from '@shared/ui/chainRow';
import { Button } from '@shared/ui/button';
import { Preloader } from '@shared/ui/preloader';
import { PageError } from '@shared/ui/pageError';
import { OfferExchangeModal } from '@features/exchange';
import { useRoute } from '../lib';

export const RoutePage = () => {
    const {
        targetId,
        isAuthenticated,
        nodes,
        isLoading,
        isError,
        hasHop,
        isEmpty,
        firstHopTarget,
        directTarget,
        goalId,
        currentCustomerId,
        openProduct,
        openFirstHopOffer,
        openGoalOffer,
        closeOffer,
        handleOfferSuccess,
        goHome,
        openAuthModal,
    } = useRoute();

    const isOfferOpen = Boolean(firstHopTarget || directTarget);
    const offerTargetId = firstHopTarget ?? directTarget ?? '';

    if (!targetId) {
        return (
            <MainSection>
                <div className={Styles['route-page__empty']}>
                    <h2 className={Styles['route-page__empty-title']}>Цель не выбрана</h2>
                    <p className={Styles['route-page__empty-text']}>
                        Выберите желаемый товар, чтобы построить маршрут обмена.
                    </p>
                    <Button onClick={goHome}>На главную</Button>
                </div>
            </MainSection>
        );
    }

    if (!isAuthenticated) {
        return (
            <MainSection>
                <section className={Styles['route-page__guest-card']}>
                    <div className={Styles['route-page__guest-card-body']}>
                        <h2 className={Styles['route-page__guest-card-title']}>
                            Войдите, чтобы построить маршрут обмена
                        </h2>
                        <p className={Styles['route-page__guest-card-text']}>
                            Авторизуйтесь, чтобы увидеть цепочку товаров до выбранной цели.
                        </p>
                    </div>
                    <Button onClick={openAuthModal}>Войти или зарегистрироваться</Button>
                </section>
            </MainSection>
        );
    }

    if (isLoading) {
        return <Preloader message={'Строим маршрут…'} />;
    }

    if (isError) {
        return <PageError message={'Не удалось построить маршрут обмена'} />;
    }

    return (
        <MainSection>
            <div className={Styles['route-page']}>
                <h1 className={Styles['route-page__title']}>Маршрут обмена</h1>

                {isEmpty ? (
                    <div className={Styles['route-page__empty']}>
                        <h2 className={Styles['route-page__empty-title']}>Маршрут не найден</h2>
                        <p className={Styles['route-page__empty-text']}>
                            Попробуйте выбрать другую цель или предложить прямой обмен.
                        </p>
                        <Button onClick={openGoalOffer}>Предложить другой товар напрямую</Button>
                    </div>
                ) : (
                    <>
                        <div className={Styles['route-page__chain']}>
                            <ChainRow nodes={nodes} onNodeClick={openProduct} />
                        </div>

                        <div className={Styles['route-page__actions']}>
                            <Button
                                className={Styles['route-page__action']}
                                onClick={openFirstHopOffer}
                                disabled={!hasHop}
                            >
                                Предложить обмен
                            </Button>
                            <Button
                                className={[
                                    Styles['route-page__action'],
                                    Styles['route-page__action--secondary'],
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                                variant="secondary"
                                onClick={openGoalOffer}
                                disabled={!goalId}
                            >
                                Предложить другой товар напрямую
                            </Button>
                        </div>
                    </>
                )}
            </div>

            <OfferExchangeModal
                isOpen={isOfferOpen}
                onClose={closeOffer}
                onSuccess={handleOfferSuccess}
                targetProductId={offerTargetId}
                currentCustomerId={currentCustomerId}
            />
        </MainSection>
    );
};
