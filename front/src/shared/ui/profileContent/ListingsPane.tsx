import type {TProduct} from '@entities/product';
import {ProductCard} from '@shared/ui/productCard';
import {Button} from '@shared/ui/button';
import {Empty} from 'antd';

import Styles from './profileContent.module.css';

type TListingsPaneProps = {
    isLoading: boolean;
    isError: boolean;
    products: TProduct[];
    onOpen: (productId: string) => void;
    onAdd: () => void;
};

/** Список объявлений пользователя (активные / архив). */
export const ListingsPane = ({isLoading, isError, products, onOpen, onAdd}: TListingsPaneProps) => {
    if (isLoading) {
        return <div className={Styles.state}>Загружаем объявления…</div>;
    }
    if (isError) {
        return <div className={Styles.state}>Не удалось загрузить объявления.</div>;
    }
    if (products.length === 0) {
        return (
            <div className={Styles.empty}>
                <Empty description="Здесь пока нет объявлений"/>
                <Button onClick={onAdd}>Добавить товар</Button>
            </div>
        );
    }
    return (
        <>
            {products.map((product) => (
                <ProductCard
                    key={product.product_id}
                    variant="horizontal"
                    title={product.title}
                    img={product.image}
                    price={product.price}
                    location={product.location}
                    description={product.description}
                    onClick={() => onOpen(product.product_id)}
                />
            ))}
        </>
    );
};
