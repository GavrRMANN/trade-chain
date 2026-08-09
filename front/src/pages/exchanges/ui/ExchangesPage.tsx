import {Button} from '@shared/ui/button';
import {MainSection} from '@shared/ui/mainSection';
import {PageError} from '@shared/ui/pageError';
import {Preloader} from '@shared/ui/preloader';
import {ExchangeRow} from '@widgets/exchangeRow';
import {ProductImage} from '@entities/product';
import {Modal} from '@shared/ui/modal';
import {formatDate} from '@shared/lib';
import {RouteBuilder} from '@features/routeBuilder';

import Styles from './exchanges-page.module.css';
import {useExchanges} from '../lib';
import type {TExchangeRouteTab, TExchangeTab} from '../lib/useExchanges';

const TABS: {id: TExchangeTab; label: string}[] = [
    {id: 'active', label: 'Активные'},
    {id: 'incoming', label: 'Входящие'},
    {id: 'outgoing', label: 'Исходящие'},
    {id: 'completed', label: 'Завершённые'},
];

const ROUTE_TABS: {id: TExchangeRouteTab; label: string}[] = [
    {id: 'active', label: 'Активные'},
    {id: 'completed', label: 'Завершённые'},
];

const EMPTY_TEXT: Record<TExchangeTab, string> = {
    active: 'Активных обменов пока нет',
    incoming: 'Нет входящих предложений',
    outgoing: 'Нет исходящих предложений',
    completed: 'Завершённых обменов пока нет',
};

const ROUTE_EMPTY_TEXT: Record<TExchangeRouteTab, string> = {
    active: 'Активных цепочек обменов пока нет',
    completed: 'Завершённых цепочек обменов пока нет',
};

const formatClasses = (...classes: Array<string | false | undefined>): string =>
    classes.filter(Boolean).join(' ');

export const ExchangesPage = () => {
    const {
        activeTab,
        setActiveTab,
        activeRouteTab,
        setActiveRouteTab,
        activeView,
        setActiveView,
        isBuilderOpen,
        setIsBuilderOpen,
        visibleRows,
        routeGroups,
        visibleRouteGroups,
        isLoading,
        isFetching,
        isError,
        openExchange,
        openRoute,
        formatActiveOffers,
    } = useExchanges();

    if (isLoading || isFetching) {
        return <Preloader message={'Загрузка обменов…'} />;
    }

    if (isError) {
        return <PageError message={'Не удалось загрузить обмены'} />;
    }

    return (
        <MainSection>
            <div className={Styles['exchanges-page']}>
                <div className={Styles['exchanges-page__view-tabs']} role="tablist">
                    <Button
                        variant="text"
                        active={activeView === 'routes'}
                        className={formatClasses(
                            Styles['exchanges-page__view-tab'],
                            activeView === 'routes' && Styles['exchanges-page__view-tab--active'],
                        )}
                        onClick={() => setActiveView('routes')}
                    >
                        Цепочки обменов
                    </Button>
                    <Button
                        variant="text"
                        active={activeView === 'exchanges'}
                        className={formatClasses(
                            Styles['exchanges-page__view-tab'],
                            activeView === 'exchanges' && Styles['exchanges-page__view-tab--active'],
                        )}
                        onClick={() => setActiveView('exchanges')}
                    >
                        Все обмены
                    </Button>
                </div>

                {activeView === 'routes' ? (
                    <>
                        <div className={Styles['exchanges-page__routes-heading']}>
                            <div>
                                <h2>Ваши цепочки</h2>
                                <p>Каждая карточка объединяет предложения, ведущие к одной цели.</p>
                            </div>
                            <Button onClick={() => setIsBuilderOpen(true)}>
                                Создать цепочку
                            </Button>
                        </div>

                        <div className={Styles['exchanges-page__tabs']} role="tablist">
                            {ROUTE_TABS.map((tab) => (
                                <Button
                                    key={tab.id}
                                    variant="text"
                                    active={activeRouteTab === tab.id}
                                    onClick={() => setActiveRouteTab(tab.id)}
                                    ariaLabel={tab.label}
                                    className={formatClasses(
                                        Styles['exchanges-page__tab'],
                                        activeRouteTab === tab.id && Styles['exchanges-page__tab--active'],
                                    )}
                                >
                                    {tab.label}
                                </Button>
                            ))}
                        </div>

                        {visibleRouteGroups.length === 0 && routeGroups.length === 0 ? (
                            <div className={Styles['exchanges-page__routes-empty']}>
                                <span aria-hidden="true">↗</span>
                                <div>
                                    <h3>Пока нет цепочек</h3>
                                    <p>
                                        Выберите свой товар и цель — мы покажем путь и варианты
                                        следующего обмена.
                                    </p>
                                </div>
                                {activeRouteTab === 'active' && !isBuilderOpen && (
                                    <Button variant="secondary" onClick={() => setIsBuilderOpen(true)}>
                                        Построить первую
                                    </Button>
                                )}
                            </div>
                        ) : visibleRouteGroups.length === 0 ? (
                            <div className={Styles['exchanges-page__empty']}>
                                {ROUTE_EMPTY_TEXT[activeRouteTab]}
                            </div>
                        ) : (
                            <div className={Styles['exchanges-page__routes-list']}>
                                {visibleRouteGroups.map((group) => (
                                    <article
                                        key={group.goalId}
                                        className={Styles['exchanges-page__route-card']}
                                    >
                                        <div className={Styles['exchanges-page__route-path']}>
                                            <div className={Styles['exchanges-page__route-product']}>
                                                <span>Сейчас</span>
                                                <div className={Styles['exchanges-page__route-media']}>
                                                    <ProductImage
                                                        src={group.sourceProduct?.image}
                                                        alt={group.sourceProduct?.title ?? ''}
                                                        title={
                                                            group.sourceProduct?.title ??
                                                            'Текущий товар'
                                                        }
                                                    />
                                                </div>
                                                <strong>
                                                    {group.sourceProduct?.title ?? 'Текущий товар'}
                                                </strong>
                                            </div>
                                            <div className={Styles['exchanges-page__route-line']} aria-hidden="true">
                                                <span>{group.completedOffersCount}</span>
                                                <i>→</i>
                                            </div>
                                            <div className={Styles['exchanges-page__route-product']}>
                                                <span>Цель</span>
                                                <div className={Styles['exchanges-page__route-media']}>
                                                    <ProductImage
                                                        src={group.goalProduct?.image}
                                                        alt={group.goalProduct?.title ?? ''}
                                                        title={
                                                            group.goalProduct?.title ??
                                                            'Цель недоступна'
                                                        }
                                                    />
                                                </div>
                                                <strong>
                                                    {group.goalProduct?.title ?? 'Цель недоступна'}
                                                </strong>
                                            </div>
                                        </div>

                                        <div className={Styles['exchanges-page__route-info']}>
                                            <div>
                                                <span>
                                                    {group.openOffersCount > 0
                                                        ? formatActiveOffers(group.openOffersCount)
                                                        : 'Нет активных предложений'}
                                                </span>
                                                <small>
                                                    Всего обменов: {group.offersCount} · Обновлено{' '}
                                                    {formatDate(group.updatedAt)}
                                                </small>
                                            </div>
                                            <Button
                                                variant="secondary"
                                                onClick={() =>
                                                    openRoute(
                                                        group.goalId,
                                                        group.sourceProduct?.product_id,
                                                    )
                                                }
                                            >
                                                Открыть цепочку
                                            </Button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className={Styles['exchanges-page__tabs']} role="tablist">
                            {TABS.map((tab) => (
                                <Button
                                    key={tab.id}
                                    variant="text"
                                    active={activeTab === tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    ariaLabel={tab.label}
                                    className={formatClasses(
                                        Styles['exchanges-page__tab'],
                                        activeTab === tab.id && Styles['exchanges-page__tab--active'],
                                    )}
                                >
                                    {tab.label}
                                </Button>
                            ))}
                        </div>

                        {visibleRows.length === 0 ? (
                            <div className={Styles['exchanges-page__empty']}>
                                {EMPTY_TEXT[activeTab]}
                            </div>
                        ) : (
                            <div className={Styles['exchanges-page__list']}>
                                {visibleRows.map((row) => (
                                    <ExchangeRow
                                        key={row.chain.chain_id}
                                        row={row}
                                        onOpen={openExchange}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                <Modal
                    title="Создание цепочки"
                    isOpen={isBuilderOpen}
                    size="large"
                    onClose={() => setIsBuilderOpen(false)}
                >
                    <RouteBuilder
                        variant="modal"
                        onCancel={() => setIsBuilderOpen(false)}
                    />
                </Modal>
            </div>
        </MainSection>
    );
};
