import {Tabs} from 'antd';
import {useNavigate} from 'react-router-dom';

import type {TProduct} from '@entities/product';
import type {TReview} from '@entities/review';
import type {TProfileExchange} from '@pages/profile/lib/useProfile';
import {ProfileSidebar} from '@shared/ui/profileSidebar';
import {ListingsPane} from '@shared/ui/profileContent/ListingsPane';
import {ExchangesPane} from '@shared/ui/profileContent/ExchangesPane';
import {ReviewsPane} from '@shared/ui/profileContent/ReviewsPane';

import Styles from './profileContent.module.css';

export type TProfileTab = 'active' | 'archived' | 'exchanges' | 'reviews';

export type TProfileContentViewModel = {
    activeTab: TProfileTab;
    setActiveTab: (tab: TProfileTab) => void;
    activeProducts: TProduct[];
    archivedProducts: TProduct[];
    visibleProducts: TProduct[];
    reviews: TReview[];
    exchanges: TProfileExchange[];
    rating: number;
    reviewsCount: number;
    isLoading: boolean;
    isError: boolean;
    onLogout?: () => void;
};

type TProfileContentProps = {
    user: {email: string};
    isPublic?: boolean;
    viewModel: TProfileContentViewModel;
};

/**
 * Составной блок профиля: сайдбар + вкладки (объявления / обмены / отзывы).
 * Вкладки рендерятся отдельными pane-компонентами.
 */
export const ProfileContent = ({user, isPublic = false, viewModel}: TProfileContentProps) => {
    const navigate = useNavigate();
    const isListingsTab =
        viewModel.activeTab === 'active' || viewModel.activeTab === 'archived';

    return (
        <div className={Styles.layout}>
            <ProfileSidebar
                name={user.email}
                rating={viewModel.rating}
                reviewsCount={viewModel.reviewsCount}
                activeListingsCount={viewModel.activeProducts.length}
                archivedListingsCount={viewModel.archivedProducts.length}
                onLogout={viewModel.onLogout}
            />
            <div className={Styles.content}>
                <section id="listings" className={Styles.listingsSection}>
                    <div className={Styles.headingRow}>
                        <h2>{isPublic ? 'Профиль пользователя' : 'Мой профиль'}</h2>
                    </div>
                    <Tabs
                        activeKey={viewModel.activeTab}
                        onChange={(key) => viewModel.setActiveTab(key as TProfileTab)}
                        items={[
                            {key: 'active', label: `Активные ${viewModel.activeProducts.length}`},
                            {key: 'archived', label: `В архиве ${viewModel.archivedProducts.length}`},
                            {key: 'exchanges', label: `Обмены ${viewModel.exchanges.length}`},
                            {key: 'reviews', label: `Отзывы ${viewModel.reviews.length}`},
                        ]}
                    />

                    {isListingsTab && (
                        <ListingsPane
                            isLoading={viewModel.isLoading}
                            isError={viewModel.isError}
                            products={viewModel.visibleProducts}
                            onOpen={(id) => navigate(`/product/${id}`)}
                            onAdd={() => navigate('/create')}
                        />
                    )}

                    {viewModel.activeTab === 'exchanges' && (
                        <ExchangesPane
                            exchanges={viewModel.exchanges}
                            onOpen={(chainId) => navigate(`/exchanges/${chainId}`)}
                        />
                    )}

                    {viewModel.activeTab === 'reviews' && <ReviewsPane reviews={viewModel.reviews}/>}
                </section>
            </div>
        </div>
    );
};
