import {useState} from 'react';

import {Button} from '@shared/ui/button';
import {MainSection} from '@shared/ui/mainSection';
import {PageError} from '@shared/ui/pageError';
import {Preloader} from '@shared/ui/preloader';
import {ProductImage} from '@shared/ui/productImage';
import {StatusBadge} from '@shared/ui/statusBadge';
import {formatDate} from '@shared/lib';
import {useOpenModalRoute} from '@shared/lib';

import Styles from './exchanges-page.module.css';
import {useExchanges} from '../lib';
import type {TExchangeRow, TExchangeTab} from '../lib/useExchanges';

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

const ProductThumb = ({product}: {product?: TExchangeRow['fromProduct']}) => {
    if (!product) {
        return (
            <div className={Styles['exchanges-page__product']}>
                <ProductImage title="?" alt="Товар недоступен" />
                <div className={Styles['exchanges-page__product-info']}>
                    <p className={Styles['exchanges-page__product-fallback']}>Товар недоступен</p>
                </div>
            </div>
        );
    }

    return (
        <div className={Styles['exchanges-page__product']}>
            <ProductImage src={product.image} alt={product.title} title={product.title} />
            <div className={Styles['exchanges-page__product-info']}>
                <p className={Styles['exchanges-page__product-title']}>{product.title}</p>
            </div>
        </div>
    );
};

const ExchangeRow = ({
    row,
    onOpen,
}: {
    row: TExchangeRow;
    onOpen: (chainId: string) => void;
}) => {
    const {chain, fromProduct, toProduct} = row;

    return (
        <div
            className={Styles['exchanges-page__row']}
            role="button"
            tabIndex={0}
            onClick={() => onOpen(chain.chain_id)}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpen(chain.chain_id);
                }
            }}
        >
            <div className={Styles['exchanges-page__products']}>
                <ProductThumb product={fromProduct} />
                <span className={Styles['exchanges-page__arrow']} aria-hidden="true">→</span>
                <ProductThumb product={toProduct} />
            </div>
            <div className={Styles['exchanges-page__meta']}>
                <StatusBadge status={chain.status} />
                <span className={Styles['exchanges-page__date']}>
                    {formatDate(chain.created_at)}
                </span>
            </div>
        </div>
    );
};

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
