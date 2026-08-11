import Styles from './catalog-page.module.css';
import { MainSection } from '@shared/ui/mainSection';
import { ProductCard, type TProduct } from '@entities/product';
import { Preloader } from '@shared/ui/preloader';
import { WhiteBox } from '@shared/ui/whiteBox';
import { Button } from '@shared/ui/button';
import { PageHeader } from '@shared/ui/pageHeader';
import { formatProductCount, useCatalog } from '../lib';
import { PageError } from '@shared/ui/pageError';

export const CatalogPage = () => {
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
        selectCategory,
        openProduct,
        openCreateProduct,
    } = useCatalog();

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
            />

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
        </MainSection>
    );
};

type TProductGridProps = {
    products: TProduct[];
    onOpen: (productId: string) => void;
};

const ProductGrid = ({ products, onOpen }: TProductGridProps) => (
    <div className={Styles.grid}>
        {products.map((product) => (
            <ProductCard
                key={product.product_id}
                title={product.title}
                img={product.image}
                price={product.price}
                location={product.location}
                matched={product.matched}
                onClick={() => onOpen(product.product_id)}
            />
        ))}
    </div>
);
