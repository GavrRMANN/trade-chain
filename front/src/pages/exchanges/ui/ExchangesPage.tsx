import {Button} from '@shared/ui/button';
import {MainSection} from '@shared/ui/mainSection';
import {PageError} from '@shared/ui/pageError';
import {PageHeader} from '@shared/ui/pageHeader';
import {Preloader} from '@shared/ui/preloader';
import {ExchangeRow} from '@widgets/exchangeRow';
import {formatDate} from '@shared/lib';

import Styles from './exchanges-page.module.css';
import {RouteGroupCard} from './RouteGroupCard';
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
        openRouteBuilder,
        openProductFilter,
        productFilter,
        resetProductFilter,
        filterableProducts,
        selectedFilterProduct,
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

    const isFilterableTab = activeTab === 'incoming' || activeTab === 'outgoing';

    if (isLoading || isFetching) {
        return <Preloader message={'Загрузка обменов…'} />;
    }

    if (isError) {
        return <PageError message={'Не удалось загрузить обмены'} />;
    }

    return (
        <MainSection>
            {/* Переключатель разделов и создание цепочки закреплены: списки
                длинные, и после прокрутки должно быть понятно, что именно
                открыто и как добавить новое. */}
            <PageHeader
                title="Мои обмены"
                tabs={
                    <div className={Styles['exchanges-page__view-tabs']} role="tablist">
                        <Button
                            variant="text"
                            active={activeView === 'routes'}
                            className={formatClasses(
                                Styles['exchanges-page__view-tab'],
                                activeView === 'routes' &&
                                    Styles['exchanges-page__view-tab--active'],
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
                                activeView === 'exchanges' &&
                                    Styles['exchanges-page__view-tab--active'],
                            )}
                            onClick={() => setActiveView('exchanges')}
                        >
                            Все обмены
                        </Button>
                    </div>
                }
                actions={
                    activeView === 'routes' ? (
                        <Button onClick={openRouteBuilder}>Создать цепочку</Button>
                    ) : undefined
                }
            />

            <div className={Styles['exchanges-page']}>
                {activeView === 'routes' ? (
                    <>
                        <div className={Styles['exchanges-page__routes-heading']}>
                            <div>
                                <h2>Ваши цепочки</h2>
                                <p>Каждая карточка объединяет предложения, ведущие к одной цели.</p>
                            </div>
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
                                {activeRouteTab === 'active' && (
                                    <Button variant="secondary" onClick={openRouteBuilder}>
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
                                    <RouteGroupCard
                                        key={group.goalId}
                                        sourceProduct={group.sourceProduct}
                                        goalProduct={group.goalProduct}
                                        openOffersCount={group.openOffersCount}
                                        offersCount={group.offersCount}
                                        updatedAt={group.updatedAt}
                                        formatActiveOffers={formatActiveOffers}
                                        formatDate={formatDate}
                                        onOpen={() => openRoute(
                                            group.goalId,
                                            group.sourceProductId,
                                            group.goalCategoryId,
                                        )}
                                    />
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

                        {isFilterableTab && (filterableProducts.length > 0 || productFilter) && (
                            <div className={Styles['exchanges-page__filter']}>
                                <Button variant="secondary" onClick={openProductFilter}>
                                    {selectedFilterProduct
                                        ? `Товар: ${selectedFilterProduct.title}`
                                        : 'Фильтр по товару'}
                                </Button>
                                {productFilter && (
                                    <Button variant="text" onClick={resetProductFilter}>
                                        Сбросить
                                    </Button>
                                )}
                            </div>
                        )}

                        {visibleRows.length === 0 ? (
                            <div className={Styles['exchanges-page__empty']}>
                                {productFilter
                                    ? 'Нет предложений по выбранному товару'
                                    : EMPTY_TEXT[activeTab]}
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
            </div>
        </MainSection>
    );
};
