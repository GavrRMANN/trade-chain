import { Empty, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';

import type { TProduct } from '@entities/product';
import type { TUser } from '@entities/user';
import { ProductCard } from '@shared/ui/productCard';
import { ProfileSidebar } from '@shared/ui/profileSidebar';

import Styles from './profileContent.module.css';

export type TProfileTab = 'active' | 'archived';

export type TProfileContentViewModel = {
    activeTab: TProfileTab;
    setActiveTab: (tab: TProfileTab) => void;
    activeProducts: TProduct[];
    archivedProducts: TProduct[];
    visibleProducts: TProduct[];
    rating: number;
    reviewsCount: number;
    isLoading: boolean;
    isError: boolean;
    onLogout?: () => void;
};

type TProfileContentProps = {
    user: TUser;
    isPublic?: boolean;
    viewModel: TProfileContentViewModel;
};

export const ProfileContent = ({ user, isPublic = false, viewModel }: TProfileContentProps) => {
    const navigate = useNavigate();

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
                    <div className={Styles.headingRow}><h2>{isPublic ? 'Объявления пользователя' : 'Мои объявления'}</h2></div>
                    <Tabs
                        activeKey={viewModel.activeTab}
                        onChange={(key) => viewModel.setActiveTab(key as TProfileTab)}
                        items={[
                            { key: 'active', label: `Активные ${viewModel.activeProducts.length}` },
                            { key: 'archived', label: `В архиве ${viewModel.archivedProducts.length}` },
                        ]}
                    />
                    {viewModel.isLoading && <div className={Styles.state}>Загружаем объявления…</div>}
                    {viewModel.isError && <div className={Styles.state}>Не удалось загрузить объявления.</div>}
                    {!viewModel.isLoading && !viewModel.isError && viewModel.visibleProducts.length === 0 && <Empty description="В этой вкладке пока нет объявлений" />}
                    {viewModel.visibleProducts.map((product) => (
                        <ProductCard
                            key={product.product_id}
                            variant="horizontal"
                            title={product.title}
                            img={product.image}
                            price={product.price}
                            location={product.location}
                            description={product.description}
                            onClick={() => navigate(`/product/${product.product_id}`)}
                        />
                    ))}
                </section>
            </div>
        </div>
    );
};
