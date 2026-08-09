import {useState} from 'react';

import {Button} from '@shared/ui/button';
import {MainSection} from '@shared/ui/mainSection';
import {PageError} from '@shared/ui/pageError';
import {Preloader} from '@shared/ui/preloader';
import {ExchangeRow} from '@shared/ui/exchangeRow';
import {useOpenModalRoute} from '@shared/lib';

import Styles from './exchanges-page.module.css';
import {useExchanges} from '../lib';
import type {TExchangeTab} from '../lib/useExchanges';

const TABS: {id: TExchangeTab; label: string}[] = [
    {id: 'incoming', label: 'Входящие'},
    {id: 'outgoing', label: 'Исходящие'},
    {id: 'completed', label: 'Завершённые'},
];

const EMPTY_TEXT: Record<TExchangeTab, string> = {
    incoming: 'Нет входящих предложений',
    outgoing: 'Нет исходящих предложений',
    completed: 'Завершённых обменов пока нет',
};

const formatClasses = (...classes: Array<string | false | undefined>): string =>
    classes.filter(Boolean).join(' ');

export const ExchangesPage = () => {
    const [activeTab, setActiveTab] = useState<TExchangeTab>('incoming');
    const openModal = useOpenModalRoute();
    const {
        isAuthenticated,
        incoming,
        outgoing,
        completed,
        isLoading,
        isFetching,
        isError,
        openExchange,
    } = useExchanges();

    if (!isAuthenticated) {
        return (
            <MainSection>
                <section className={Styles['exchanges-page__guest']}>
                    <div>
                        <h2>Войдите, чтобы увидеть свои обмены</h2>
                        <p>
                            Отслеживайте входящие и исходящие предложения об обмене
                            и историю завершённых сделок.
                        </p>
                        <Button onClick={() => openModal('auth')}>Войти</Button>
                    </div>
                </section>
            </MainSection>
        );
    }

    if (isLoading || isFetching) {
        return <Preloader message={'Загрузка обменов…'} />;
    }

    if (isError) {
        return <PageError message={'Не удалось загрузить обмены'} />;
    }

    const visibleRows = activeTab === 'incoming'
        ? incoming
        : activeTab === 'outgoing'
            ? outgoing
            : completed;

    return (
        <MainSection>
            <div className={Styles['exchanges-page']}>
                <h1 className={Styles['exchanges-page__title']}>Мои обмены</h1>

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
            </div>
        </MainSection>
    );
};
