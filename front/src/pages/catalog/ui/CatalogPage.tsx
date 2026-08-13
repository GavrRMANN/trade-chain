import Styles from './catalog-page.module.css';
import { MainSection } from '@shared/ui/mainSection';
import { Preloader } from '@shared/ui/preloader';
import { WhiteBox } from '@shared/ui/whiteBox';
import { Button } from '@shared/ui/button';
import { PageHeader } from '@shared/ui/pageHeader';
import { ViewModeToggle } from '@shared/ui/viewModeToggle';
import { ProductFeed } from '@widgets/productFeed';
import { formatProductCount, useCatalog, useCatalogViewMode, useFeedOwners } from '../lib';
import { PageError } from '@shared/ui/pageError';

import { ProductGrid } from './ProductGrid';

const VIEW_MODE_OPTIONS = [
    { value: 'feed' as const, label: 'Лента' },
    { value: 'grid' as const, label: 'Сетка' },
];

export const CatalogPage = () => {
    const { viewMode, setViewMode } = useCatalogViewMode();
    /* Имя и рейтинг владельца видны только в ленте, поэтому в режиме сетки
       список участников не запрашивается. */
    const owners = useFeedOwners({ skip: viewMode !== 'feed' });
    const {
        title,
        categoryTitle,
        categoryFilters,
        selectedCategory,
        products,
        matchedProducts,
        restProducts,
        isLoading,
        isFetching,
        isError,
        hasMore,
        isCategoriesLoading,
        isCategoriesError,
        loadMoreRef,
        categoryNames,
        filtersKey,
        feedIndex,
        saveFeedIndex,
        selectCategory,
        openProduct,
        openCreateProduct,
        openOwner,
        openRouteTo,
        openOffer,
    } = useCatalog(viewMode);

    if (isCategoriesLoading) {
        return <Preloader message={'Загрузка...'} />;
    }

    if (isCategoriesError) {
        return <PageError message={'Не удалось загрузить категории'} />;
    }

    return (
        <MainSection>
            <PageHeader
                title={title}
                meta={
                    <>
                        {categoryTitle && <span>{categoryTitle}</span>}
                        {products.length > 0 && (
                            <span>
                                {formatProductCount(products.length)}
                                {hasMore ? ' и ещё' : ''}
                            </span>
                        )}
                    </>
                }
                compactActions
                actions={
                    <ViewModeToggle
                        ariaLabel="Режим просмотра каталога"
                        options={VIEW_MODE_OPTIONS}
                        value={viewMode}
                        onChange={setViewMode}
                        size="sm"
                    />
                }
            />

            {/* В ленте фильтр категорий скрыт: карточка должна занимать экран
                целиком, а ряд плиток съедал бы её верх на каждом товаре.
                Категория остаётся в адресе и переключается в режиме сетки. */}
            {viewMode === 'grid' && (
                <div className={Styles.categories} aria-label="Быстрый фильтр по категориям">
                    {categoryFilters.map((category) => (
                        <WhiteBox
                            key={category.id}
                            title={category.title}
                            icon={category.icon}
                            img={category.image}
                            active={selectedCategory === category.id}
                            onClick={() => selectCategory(category.id)}
                        />
                    ))}
                </div>
            )}
            {viewMode === 'feed' ? (
                <>
                    {isLoading && products.length === 0 ? (
                        <div className={Styles['catalog-state']}>
                            <Preloader />
                        </div>
                    ) : isError && products.length === 0 ? (
                        <p className={Styles['catalog-state']}>Не удалось загрузить товары</p>
                    ) : (
                        <ProductFeed
                            products={products}
                            hasMore={hasMore}
                            isFetching={isFetching}
                            loadMoreRef={loadMoreRef}
                            categoryNames={categoryNames}
                            owners={owners}
                            initialIndex={feedIndex}
                            positionKey={filtersKey}
                            onActiveIndexChange={saveFeedIndex}
                            onOpenProduct={openProduct}
                            onOpenOwner={openOwner}
                            onOfferExchange={openOffer}
                            onBuildRoute={openRouteTo}
                        />
                    )}
                </>
            ) : (
            <div className={Styles['catalog-page']}>
                {(isLoading || (isFetching && products.length === 0)) && (
                    <div className={Styles['catalog-state']}>
                        <Preloader />
                    </div>
                )}

                {!isLoading && isError && products.length === 0 && (
                    <p className={Styles['catalog-state']}>Не удалось загрузить товары</p>
                )}

                {/* Блок «Вам подойдёт» появляется, только когда обмен возможен
                    напрямую: пустой заголовок обещал бы то, чего в ленте нет. */}
                {!isLoading && matchedProducts.length > 0 && (
                    <section className={Styles.section}>
                        <h2 className={Styles['section-title']}>Вам подойдёт</h2>
                        <p className={Styles['section-subtitle']}>
                            Владельцам этих вещей подходит что-то из вашего профиля — обмен возможен
                            напрямую
                        </p>
                        <ProductGrid products={matchedProducts} onOpen={openProduct} />
                    </section>
                )}

                {!isLoading && restProducts.length > 0 && (
                    <section className={Styles.section}>
                        {matchedProducts.length > 0 && (
                            <h2 className={Styles['section-title']}>Остальное в обороте</h2>
                        )}
                        <ProductGrid products={restProducts} onOpen={openProduct} />
                    </section>
                )}

                {!isLoading && !isFetching && !isError && products.length === 0 && (
                    <div className={Styles.emptyState}>
                        <h2>В этой категории пока ничего нет</h2>
                        <p>Но вы можете добавить сюда первый товар.</p>
                        <Button onClick={openCreateProduct}>Добавить товар</Button>
                    </div>
                )}

                {products.length > 0 && hasMore && (
                    <div ref={loadMoreRef} className={Styles['catalog-state']}>
                        {isFetching && <Preloader />}
                    </div>
                )}

                {!isLoading && isError && products.length > 0 && (
                    <p className={Styles['catalog-state']}>Не удалось загрузить следующие товары</p>
                )}
            </div>
            )}
        </MainSection>
    );
};
