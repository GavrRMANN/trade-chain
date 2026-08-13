import type {TProduct} from '@entities/product';
import type {TReview} from '@entities/review';
import type {TProfileExchange, TProfileTab} from '@pages/profile/lib/useProfile';
import {Button} from '@shared/ui/button';
import {ExchangeRow} from '@widgets/exchangeRow';
import {ProfileSidebar} from '@widgets/profileSidebar';
import {ReviewCard} from '@entities/review';
import {ProfileProductRow} from '@widgets/profile';
import {PageHeader} from '@shared/ui/pageHeader';
import {CustomerRecommendationsEditor} from '@features/customerRecommendations';

import {EmptyState} from './EmptyState';
import Styles from './profile-content.module.css';

type TProfileContentViewModel = {
    activeTab: TProfileTab;
    setActiveTab: (tab: TProfileTab) => void;
    products: TProduct[];
    archivedProducts: TProduct[];
    reviews: TReview[];
    exchanges: TProfileExchange[];
    rating: number;
    reviewsCount: number;
    isProductsLoading: boolean;
    isProductsError: boolean;
    isReviewsLoading: boolean;
    isReviewsError: boolean;
    isExchangesLoading: boolean;
    isExchangesError: boolean;
    onLogout?: () => void;
    maskedName: string;
    getTabCount: (tab: TProfileTab) => number;
    openProduct: (productId: string) => void;
    openEditProduct: (productId: string) => void;
    openExchange: (chainId: string) => void;
    openExchanges: () => void;
    openCreate: () => void;
};

type TProfileContentProps = {
    user: {customer_id: string; email: string; created_at: string};
    isOwner: boolean;
    viewModel: TProfileContentViewModel;
};

const OWNER_TABS: {id: TProfileTab; label: string}[] = [
    {id: 'products', label: 'Товары'},
    {id: 'archive', label: 'Архив'},
    {id: 'exchanges', label: 'Цепочки обменов'},
    {id: 'reviews', label: 'Отзывы'},
];

const PUBLIC_TABS = OWNER_TABS.filter(({id}) => id !== 'exchanges');

/** Собирает публичные данные профиля и приватные возможности владельца. */
export const ProfileContent = ({
    user,
    isOwner,
    viewModel,
}: TProfileContentProps) => {
    const tabs = isOwner ? OWNER_TABS : PUBLIC_TABS;

    const renderContent = () => {
        if (viewModel.activeTab === 'exchanges' && isOwner) {
            if (viewModel.isExchangesLoading) {
                return <div className={Styles.state}>Загружаем цепочки обменов…</div>;
            }
            if (viewModel.isExchangesError) {
                return <div className={Styles.state}>Не удалось загрузить цепочки обменов.</div>;
            }
            return viewModel.exchanges.length ? (
                <div className={Styles.list}>
                    {viewModel.exchanges.map((exchange) => (
                        <ExchangeRow
                            key={exchange.chain.chain_id}
                            row={exchange}
                            onOpen={viewModel.openExchange}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="Цепочек обменов пока нет"
                    description="Предлагайте свои товары в обмен — активные и завершённые цепочки появятся здесь."
                    actionLabel="Перейти к обменам"
                    onAction={viewModel.openExchanges}
                />
            );
        }

        if (viewModel.activeTab === 'reviews') {
            if (viewModel.isReviewsLoading) {
                return <div className={Styles.state}>Загружаем отзывы…</div>;
            }
            if (viewModel.isReviewsError) {
                return <div className={Styles.state}>Не удалось загрузить отзывы.</div>;
            }
            return viewModel.reviews.length ? (
                <section id="reviews" className={Styles.list}>
                    {viewModel.reviews.map((review) => (
                        <ReviewCard key={review.review_id} review={review}/>
                    ))}
                </section>
            ) : (
                <EmptyState
                    title="Отзывов пока нет"
                    description="Отзывы появляются после завершённых обменов."
                />
            );
        }

        if (viewModel.isProductsLoading) {
            return <div className={Styles.state}>Загружаем товары…</div>;
        }
        if (viewModel.isProductsError) {
            return <div className={Styles.state}>Не удалось загрузить товары.</div>;
        }

        return (
            <>
                {(viewModel.activeTab === 'archive' ? viewModel.archivedProducts : viewModel.products).length ? (
                    <div className={Styles.list}>
                        {(viewModel.activeTab === 'archive' ? viewModel.archivedProducts : viewModel.products).map((product) => (
                            <ProfileProductRow
                                key={product.product_id}
                                product={product}
                                isOwner={isOwner}
                                onOpen={() => viewModel.openProduct(product.product_id)}
                                onEdit={() => viewModel.openEditProduct(product.product_id)}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title={viewModel.activeTab === 'archive' ? 'Архив пока пуст' : isOwner ? 'У вас пока нет товаров' : 'У пользователя пока нет товаров'}
                        description={viewModel.activeTab === 'archive' ? 'Здесь сохраняются товары после завершённых обменов и снятые с обмена объявления.' : isOwner ? 'Добавьте первый товар, чтобы начать обмен.' : 'Здесь появятся активные объявления пользователя.'}
                        actionLabel={isOwner && viewModel.activeTab !== 'archive' ? 'Добавить товар' : undefined}
                        onAction={isOwner && viewModel.activeTab !== 'archive' ? viewModel.openCreate : undefined}
                    />
                )}
            </>
        );
    };

    return (
        <>
            {/* Имя и разделы профиля закреплены: боковая колонка с карточкой
                пользователя уезжает вверх, а список товаров длинный. */}
            <PageHeader
                title={viewModel.maskedName}
                tabs={
                    <nav className={Styles.tabs} aria-label="Разделы профиля">
                        {tabs.map((tab) => (
                            <Button
                                key={tab.id}
                                variant="text"
                                active={viewModel.activeTab === tab.id}
                                className={`${Styles.tab} ${viewModel.activeTab === tab.id ? Styles.tabActive : ''}`}
                                onClick={() => viewModel.setActiveTab(tab.id)}
                                ariaLabel={`${tab.label}: ${viewModel.getTabCount(tab.id)}`}
                            >
                                {tab.label} <span>{viewModel.getTabCount(tab.id)}</span>
                            </Button>
                        ))}
                    </nav>
                }
            />

            <div className={Styles.layout}>
                <ProfileSidebar
                    name={viewModel.maskedName}
                    createdAt={user.created_at}
                    rating={viewModel.rating}
                    reviewsCount={viewModel.reviewsCount}
                    productsCount={viewModel.products.length}
                    exchangesCount={isOwner ? viewModel.exchanges.length : undefined}
                    onReviewsClick={() => viewModel.setActiveTab('reviews')}
                    onLogout={isOwner ? viewModel.onLogout : undefined}
                />

                <section className={Styles.content}>
                    {isOwner && viewModel.activeTab === 'products' && <CustomerRecommendationsEditor />}

                    <div className={Styles.heading}>
                        <div>
                            <h2>
                                {viewModel.activeTab === 'products' ||
                                viewModel.activeTab === 'archive'
                                    ? viewModel.activeTab === 'archive'
                                        ? 'Архив товаров'
                                        : isOwner
                                          ? 'Мои товары'
                                          : 'Товары пользователя'
                                    : viewModel.activeTab === 'exchanges'
                                      ? 'Мои цепочки обменов'
                                      : 'Отзывы'}
                            </h2>
                            {viewModel.activeTab === 'exchanges' && (
                                <p>
                                    Показываем только ваши цепочки: чужая история недоступна
                                    через API.
                                </p>
                            )}
                        </div>
                        {isOwner && viewModel.activeTab === 'products' && (
                            <Button onClick={viewModel.openCreate}>Добавить товар</Button>
                        )}
                    </div>

                    {renderContent()}
                </section>
            </div>
        </>
    );
};
