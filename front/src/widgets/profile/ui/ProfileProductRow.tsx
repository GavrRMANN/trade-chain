import type {TProduct} from '@entities/product';
import {formatAmount, formatDate} from '@shared/lib';
import {Button} from '@shared/ui/button';
import {ProductImage} from '@entities/product';

import Styles from './profile-product-row.module.css';

type TProfileProductRowProps = {
    product: TProduct;
    isOwner: boolean;
    onOpen: () => void;
    onEdit: () => void;
    openLabel?: string;
};

const PRODUCT_STATUS_LABELS: Record<TProduct['status'], string> = {
    active: 'Активен',
    reserved: 'Зарезервирован',
    exchanged: 'Обменян',
    archived: 'В архиве',
};

/** Показывает товар профиля с действиями, доступными текущему зрителю. */
export const ProfileProductRow = ({
    product,
    isOwner,
    onOpen,
    onEdit,
    openLabel = 'Открыть',
}: TProfileProductRowProps) => (
    <article className={Styles.row}>
        <div className={Styles.media}>
            <ProductImage src={product.image} alt={product.title} title={product.title}/>
        </div>
        <div className={Styles.body}>
            <div className={Styles.titleRow}>
                <div className={Styles.titleBlock}>
                    <h3>{product.title}</h3>
                    {product.price !== undefined && <strong>{formatAmount(product.price)}</strong>}
                </div>
                <div className={Styles.meta}>
                    <span className={`${Styles.status} ${Styles[`status--${product.status}`]}`}>
                        {PRODUCT_STATUS_LABELS[product.status]}
                    </span>
                    <span>Обновлено {formatDate(product.updated_at)}</span>
                </div>
            </div>
            {product.location && <p className={Styles.location}>{product.location}</p>}
            {product.description && <p className={Styles.description}>{product.description}</p>}
            <div className={Styles.actions}>
                {product.status !== 'archived' && <Button variant="secondary" onClick={onOpen}>{openLabel}</Button>}
                {isOwner && product.status !== 'archived' && <Button variant="text" onClick={onEdit}>Редактировать</Button>}
            </div>
        </div>
    </article>
);
