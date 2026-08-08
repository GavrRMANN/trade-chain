import { useLayoutEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { usePageTitle } from '@app/providers/pageTitle';
import { ProductSection } from '@shared/ui/productSection';
import { ProductImage } from '@shared/ui/productImage';
import { SellerInfo } from '@shared/ui/sellerInfo';
import { MainSection } from '@shared/ui/mainSection';
import { Preloader } from '@shared/ui/preloader';
import { ProductCard } from '@shared/ui/productCard';
import { Button } from '@shared/ui/button';
import { formatAmount } from '@shared/lib';
import { useProductPageData } from '../lib';

import Styles from './product-page.module.css';

const statusLabels = {
    active: 'Товар активен',
    reserved: 'Товар зарезервирован',
    exchanged: 'Товар обменян',
    archived: 'Товар в архиве',
} as const;

export const ProductPage = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const { setTitle } = usePageTitle();
    const { product, customer, wishlist, wishlistOptions, matchingProducts, reviews, isLoading, isError } =
        useProductPageData(productId);

    useLayoutEffect(() => {
        setTitle('');
    }, [setTitle]);

    if (isLoading) {
        return <Preloader />;
    }

    if (isError || !product) {
        return (
            <MainSection>
                <div className={Styles.placeholder}>
                    <h1>Не удалось загрузить товар</h1>
                    <p>Попробуйте вернуться в каталог и открыть объявление ещё раз.</p>
                    <Button variant="text" onClick={() => navigate('/')}>Вернуться в каталог</Button>
                </div>
            </MainSection>
        );
    }

    const sellerName = customer?.email || 'Email не указан';
    const ratingText = reviews.length ? `Отзывов: ${reviews.length}` : 'Пока без отзывов';
    const statusLabel = statusLabels[product.status];

    return (
        <MainSection>
            <div className={Styles.page}>
                <header className={Styles.topbar}>
                    <h1>{product.title}</h1>
                    <p className={Styles.price}>{product.price !== undefined ? formatAmount(product.price) : 'Цена не указана'}</p>
                </header>

                <div className={Styles.hero}>
                    <div className={Styles.mediaColumn}>
                        <ProductImage src={product.image} alt={product.title} title={product.title} />
                    </div>
                    <aside className={Styles.productAside}>
                        <div className={Styles.status}>{statusLabel}</div>
                        <SellerInfo name={sellerName} meta={ratingText} profileId={product.customer_id} />
                        <section className={Styles.exchange}>
                            <h2>Что хочет взамен</h2>
                            {wishlist && wishlistOptions.length ? (
                                <div className={Styles.wishlist}>
                                    {wishlistOptions.map((option) => <span key={option.category_id}>{option.name}</span>)}
                                </div>
                            ) : wishlist ? (
                                <p className={Styles.muted}>{wishlist.name}</p>
                            ) : (
                                <p className={Styles.muted}>Владелец пока не указал, что хочет получить.</p>
                            )}
                        </section>
                        <section className={Styles.recommendations} aria-label="Подходящие вещи">
                            <h2>Ваши подходящие вещи</h2>
                            {matchingProducts.length ? (
                                <div className={Styles.matches}>
                                    {matchingProducts.map((match) => (
                                        <ProductCard key={match.product_id} title={match.title} img={match.image} price={match.price} location={match.location} />
                                    ))}
                                </div>
                            ) : (
                                <div className={Styles.emptyMatch}>
                                    <h3>Прямой обмен пока не складывается</h3>
                                    <p>Ни одна из ваших вещей не подходит под пожелания владельца. Можно предложить что-то другое — владелец решит сам, или построить маршрут через промежуточные обмены.</p>
                                    <Button variant="text" onClick={() => navigate('/')}>Открыть маршрут</Button>
                                </div>
                            )}
                        </section>
                    </aside>
                </div>

                <div className={Styles.details}>
                    <ProductSection title="Характеристики">
                        <dl className={Styles.characteristics}>
                            <div><dt>Статус</dt><dd>{statusLabel}</dd></div>
                            <div><dt>Город</dt><dd>{product.location || 'Не указан'}</dd></div>
                            <div><dt>Цена</dt><dd className={Styles.strong}>{product.price !== undefined ? formatAmount(product.price) : 'Не указана'}</dd></div>
                        </dl>
                    </ProductSection>

                    <ProductSection title="Описание">
                        <p className={Styles.description}>{product.description || 'Описание не указано.'}</p>
                    </ProductSection>
                </div>

            </div>
        </MainSection>
    );
};
