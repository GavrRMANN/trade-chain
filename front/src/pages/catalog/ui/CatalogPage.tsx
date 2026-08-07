import Styles from './catalog-page.module.css';
import {MainSection} from '@shared/ui/mainSection';
import {ProductCard} from '@shared/ui/productCard';
import {useGetProductsQuery} from '@entities/product';
import {usePageTitle} from "@app/providers/pageTitle";
import {useEffect, useLayoutEffect} from "react";

export const CatalogPage = () => {
    const {setTitle} = usePageTitle();

    const {
        data,
        isLoading,
        isError,
    } = useGetProductsQuery({
        page: 1,
        limit: 20,
    });

    useLayoutEffect(() => {
        setTitle('Вещи в обороте');
    }, []);

    if (isLoading) {
        return <p>Загрузка товаров...</p>;
    }

    if (isError) {
        return <p>Не удалось загрузить товары</p>;
    }

    return (
        <MainSection>
            <div className={Styles['catalog-page']}>
                {data?.items.map((product) => (
                    <ProductCard
                        key={product.product_id}
                        title={product.name}
                        img={product.image_url || undefined}
                        price={product.price}
                        location={product.location}
                    />
                ))}
            </div>
        </MainSection>
    );
};