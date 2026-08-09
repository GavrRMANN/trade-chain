import {useNavigate} from 'react-router-dom';

import type {TProduct} from '@entities/product';
import type {TReview} from '@entities/review';
import type {TProfileExchange, TProfileTab} from '@pages/profile/lib/useProfile';
import {Button} from '@shared/ui/button';
import {ExchangeRow} from '@widgets/exchangeRow';
import {ProfileSidebar} from '@widgets/profileSidebar';
import {ReviewCard} from '@entities/review';
import {ProfileProductRow} from '@widgets/profile';

import {EmptyState} from './EmptyState';
import Styles from './profile-content.module.css';

type TProfileContentViewModel = {
    activeTab: TProfileTab;
    setActiveTab: (tab: TProfileTab) => void;
    products: TProduct[];
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
};

type TProfileContentProps = {
    user: {customer_id: string; email: string; created_at: string};
    isOwner: boolean;
    viewModel: TProfileContentViewModel;
};

const OWNER_TABS: {id: TProfileTab; label: string}[] = [
    {id: 'products', label: 'Товары'},
    {id: 'exchanges', label: 'Цепочки обменов'},
    {id: 'reviews', label: 'Отзывы'},
];

const PUBLIC_TABS = OWNER_TABS.filter(({id}) => id !== 'exchanges');

const getTabCount = (tab: TProfileTab, viewModel: TProfileContentViewModel): number => {
    if (tab === 'products') return viewModel.products.length;
    if (tab === 'exchanges') return viewModel.exchanges.length;
    return viewModel.reviews.length;
};

const maskEmail = (email: string): string => {
    const [name, domain] = email.split('@');
    if (!domain) return 'Пользователь';
    return `${name.slice(0, 2)}***@${domain}`;
};

/** Собирает публичные данные профиля и приватные возможности владельца. */
export const ProfileContent = ({
    user,
    isOwner,
    viewModel,
}: TProfileContentProps) => {
    const navigate = useNavigate();
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
                            onOpen={(chainId) => navigate(`/exchanges/${chainId}`)}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="Цепочек обменов пока нет"
                    description="Предлагайте свои товары в обмен — активные и завершённые цепочки появятся здесь."
                    actionLabel="Перейти к обменам"
                    onAction={() => navigate('/exchanges')}
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
                {viewModel.products.length ? (
                    <div className={Styles.list}>
                        {viewModel.products.map((product) => (
                            <ProfileProductRow
                                key={product.product_id}
                                product={product}
                                isOwner={isOwner}
                                onOpen={() => navigate(`/product/${product.product_id}`)}
                                onEdit={() => navigate(`/product/${product.product_id}/edit`)}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title={isOwner ? 'У вас пока нет товаров' : 'У пользователя пока нет товаров'}
                        description={isOwner ? 'Добавьте первый товар, чтобы начать обмен.' : 'Здесь появятся активные объявления пользователя.'}
                        actionLabel={isOwner ? 'Добавить товар' : undefined}
                        onAction={isOwner ? () => navigate('/create') : undefined}
                    />
                )}

                {isOwner && !viewModel.isExchangesError && viewModel.exchanges.length > 0 && (
                    <section className={Styles.preview} aria-labelledby="profile-exchanges-preview">
                        <div className={Styles.previewHeading}>
                            <div>
                                <h3 id="profile-exchanges-preview">Последние цепочки</h3>
                                <p>Ваши недавние предложения и обмены.</p>
                            </div>
                            <Button variant="text" onClick={() => viewModel.setActiveTab('exchanges')}>
                                Все цепочки
                            </Button>
                        </div>
                        <ExchangeRow
                            row={viewModel.exchanges[0]}
                            onOpen={(chainId) => navigate(`/exchanges/${chainId}`)}
                        />
                    </section>
                )}
            </>
        );
    };

    return (
        <div className={Styles.layout}>
            <ProfileSidebar
                name={isOwner ? user.email : maskEmail(user.email)}
                createdAt={user.created_at}
                rating={viewModel.rating}
                reviewsCount={viewModel.reviewsCount}
                productsCount={viewModel.products.length}
                exchangesCount={isOwner ? viewModel.exchanges.length : undefined}
                onReviewsClick={() => viewModel.setActiveTab('reviews')}
                onLogout={isOwner ? viewModel.onLogout : undefined}
            />

            <section className={Styles.content}>
                <nav className={Styles.tabs} aria-label="Разделы профиля">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.id}
                            variant="text"
                            active={viewModel.activeTab === tab.id}
                            className={`${Styles.tab} ${viewModel.activeTab === tab.id ? Styles.tabActive : ''}`}
                            onClick={() => viewModel.setActiveTab(tab.id)}
                            ariaLabel={`${tab.label}: ${getTabCount(tab.id, viewModel)}`}
                        >
                            {tab.label} <span>{getTabCount(tab.id, viewModel)}</span>
                        </Button>
                    ))}
                </nav>

                <div className={Styles.heading}>
                    <div>
                        <h2>
                            {viewModel.activeTab === 'products'
                                ? isOwner ? 'Мои товары' : 'Товары пользователя'
                                : viewModel.activeTab === 'exchanges'
                                    ? 'Мои цепочки обменов'
                                    : 'Отзывы'}
                        </h2>
                        {viewModel.activeTab === 'exchanges' && (
                            <p>Показываем только ваши цепочки: чужая история недоступна через API.</p>
                        )}
                    </div>
                    {isOwner && viewModel.activeTab === 'products' && (
                        <Button onClick={() => navigate('/create')}>Добавить товар</Button>
                    )}
                </div>

                {renderContent()}
            </section>
        </div>
    );
};
