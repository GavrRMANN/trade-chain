import Styles from './catalog-page.module.css';
import { MainSection } from '@shared/ui/mainSection';
import { ProductCard } from '@shared/ui/productCard';
import { Preloader } from '@shared/ui/preloader';
import { WhiteBox } from '@shared/ui/whiteBox';
import { Button } from '@shared/ui/button';
import { useCatalog } from '../lib';
import { PageError } from '@shared/ui/pageError';

export const CatalogPage = () => {
    const {
        categoryFilters,
        selectedCategory,
        products,
        isLoading,
        isFetching,
        isError,
        isCategoriesLoading,
        isCategoriesError,
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
            <div className={Styles.categories} aria-label="Быстрый фильтр по категориям">
                {categoryFilters.map((category) => (
                    <WhiteBox
                        key={category.id}
                        title={category.title}
                        img={category.image}
                        active={selectedCategory === category.id}
                        onClick={() => selectCategory(category.id)}
                    />
                ))}
            </div>
            <div className={Styles['catalog-page']}>
                {(isLoading || isFetching) && (
                    <div className={Styles['catalog-state']}>
                        <Preloader />
                    </div>
                )}

                {!isLoading && !isFetching && isError && (
                    <p className={Styles['catalog-state']}>Не удалось загрузить товары</p>
                )}

                {!isLoading &&
                    !isFetching &&
                    !isError &&
                    products?.map((product) => (
                        <ProductCard
                            key={product.product_id}
                            title={product.title}
                            img={product.image}
                            price={product.price}
                            location={product.location}
                            onClick={() => openProduct(product.product_id)}
                        />
                    ))}

                {!isLoading && !isFetching && !isError && products?.length === 0 && (
                    <div className={Styles.emptyState}>
                        <h2>В этой категории пока ничего нет</h2>
                        <p>Но вы можете добавить сюда первый товар.</p>
                        <Button onClick={openCreateProduct}>Добавить товар</Button>
                    </div>
                )}
            </div>
        </MainSection>
    );
};
