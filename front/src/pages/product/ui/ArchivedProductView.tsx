import type { TCategory } from '@entities/category';
import { ProductImage } from '@entities/product';
import type { TProduct } from '@entities/product';
import { MainSection } from '@shared/ui/mainSection';
import { PageHeader } from '@shared/ui/pageHeader';
import { SellerInfo } from '@widgets/sellerInfo';
import { formatAmount, formatDate } from '@shared/lib';

import Styles from './product-page.module.css';

type TArchivedProductViewProps = {
    product: TProduct;
    category?: TCategory;
    wishlistOptions: TCategory[];
    sellerName: string;
    averageRating?: number;
    hasRating: boolean;
    ratingText: string;
};

/**
 * Витрина архивного товара: только факты, без единой кнопки действия.
 *
 * Архивный товар — мёртвый груз (снят владельцем или уже обменян), поэтому
 * тут нет «Редактировать», «Предложить обмен» и «Построить цепочку» — их
 * нельзя выполнить ни владельцу, ни зрителю, а раньше кнопки просто рисовались
 * поверх недоступного действия.
 */
export const ArchivedProductView = ({
    product,
    category,
    wishlistOptions,
    sellerName,
    averageRating,
    hasRating,
    ratingText,
}: TArchivedProductViewProps) => (
    <MainSection>
        <PageHeader
            title={product.title}
            meta={
                <>
                    <strong className={Styles['product-page__price']}>
                        {product.price !== undefined
                            ? formatAmount(product.price)
                            : 'Цена не указана'}
                    </strong>
                    <span className={Styles['product-page__status']}>В архиве</span>
                    {product.location && <span>{product.location}</span>}
                </>
            }
        />

        <article className={Styles['product-page']}>
            <div className={Styles['product-page__hero']}>
                <div className={Styles['product-page__main']}>
                    <div className={Styles['product-page__overview']}>
                        <div className={Styles['product-page__media']}>
                            <ProductImage
                                src={product.image}
                                alt={product.title}
                                title={product.title}
                            />
                        </div>
                        <div className={Styles['product-page__details']}>
                            <section className={Styles['product-page__section']}>
                                <h2>О товаре</h2>
                                <dl className={Styles['product-page__facts']}>
                                    <div>
                                        <dt>Категория</dt>
                                        <dd>{category?.name || 'Не указана'}</dd>
                                    </div>
                                    <div>
                                        <dt>Статус</dt>
                                        <dd>В архиве</dd>
                                    </div>
                                    <div>
                                        <dt>Город</dt>
                                        <dd>{product.location || 'Не указан'}</dd>
                                    </div>
                                </dl>
                            </section>
                            <dl className={Styles['product-page__dates']}>
                                <div>
                                    <dt>Размещено</dt>
                                    <dd>{formatDate(product.created_at, 'long')}</dd>
                                </div>
                                <div>
                                    <dt>Обновлено</dt>
                                    <dd>{formatDate(product.updated_at, 'long')}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <section
                        className={`${Styles['product-page__section']} ${Styles['product-page__description']}`}
                    >
                        <h2>Описание</h2>
                        <p>{product.description || 'Владелец не добавил описание.'}</p>
                    </section>
                </div>

                <aside className={Styles['product-page__aside']}>
                    <section className={Styles['product-page__panel']}>
                        <h2>Товар в архиве</h2>
                        <p className={Styles['product-page__muted']}>
                            Объявление снято с обмена или уже обменяно и хранится только для
                            истории. Действия с ним больше недоступны.
                        </p>
                    </section>

                    <section className={Styles['product-page__panel']}>
                        <h2>Продавец</h2>
                        <SellerInfo
                            name={sellerName}
                            meta={ratingText}
                            rating={averageRating}
                            hasRating={hasRating}
                            profileId={product.customer_id}
                        />
                    </section>

                    {wishlistOptions.length > 0 && (
                        <section className={Styles['product-page__panel']}>
                            <h2>Хотели взамен</h2>
                            <div className={Styles['product-page__wishlist']}>
                                {wishlistOptions.map((option) => (
                                    <span key={option.category_id}>{option.name}</span>
                                ))}
                            </div>
                        </section>
                    )}
                </aside>
            </div>
        </article>
    </MainSection>
);
