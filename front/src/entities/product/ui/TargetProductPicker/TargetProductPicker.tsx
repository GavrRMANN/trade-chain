import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Selector } from '@shared/ui/selector';

import type { TProduct } from '../../types';
import { ProductImage } from '../ProductImage/ProductImage';
import { useTargetProductPicker } from './useTargetProductPicker';
import Styles from './TargetProductPicker.module.css';

type TTargetProductPickerProps = {
    products: TProduct[];
    categories: Array<{ category_id: string; name: string }>;
    currentCustomerId: string;
    value: string;
    disabled?: boolean;
    isLoading?: boolean;
    isError?: boolean;
    onChange: (productId: string) => void;
};

const getProductMeta = (product: TProduct): string =>
    [
        product.price === undefined ? undefined : `${product.price.toLocaleString('ru-RU')} ₽`,
        product.location,
    ]
        .filter(Boolean)
        .join(' · ');

/** Выбор целевого объявления через поиск по названию или категории. */
export const TargetProductPicker = ({
    products,
    categories,
    currentCustomerId,
    value,
    disabled = false,
    isLoading = false,
    isError = false,
    onChange,
}: TTargetProductPickerProps) => {
    const {
        searchMode,
        searchValue,
        categoryId,
        targetProducts,
        selectMode,
        selectCategory,
        search,
    } = useTargetProductPicker({ products, currentCustomerId, onSelect: onChange });
    const categoryOptions = [
        { value: '', label: 'Выберите категорию' },
        ...categories.map((category) => ({ value: category.category_id, label: category.name })),
    ];

    return (
        <section className={Styles.picker} aria-label="Куда хотим прийти">
            <div className={Styles.picker__heading}>
                <span>2</span>
                <div>
                    <h3>Куда хотим прийти</h3>
                    <p>Найдите товар или откройте категорию</p>
                </div>
            </div>

            <div className={Styles.picker__mode} role="tablist" aria-label="Способ поиска цели">
                <Button
                    type="button"
                    variant="text"
                    active={searchMode === 'product'}
                    className={searchMode === 'product' ? Styles['picker__mode--active'] : ''}
                    disabled={disabled}
                    onClick={() => selectMode('product')}
                >
                    По товару
                </Button>
                <Button
                    type="button"
                    variant="text"
                    active={searchMode === 'category'}
                    className={searchMode === 'category' ? Styles['picker__mode--active'] : ''}
                    disabled={disabled}
                    onClick={() => selectMode('category')}
                >
                    По категории
                </Button>
            </div>

            {searchMode === 'product' ? (
                <Input
                    value={searchValue}
                    placeholder="Например, iPhone 15"
                    disabled={disabled}
                    onChange={search}
                />
            ) : (
                <Selector
                    value={categoryId}
                    label="Категория цели"
                    options={categoryOptions}
                    disabled={disabled}
                    loading={isLoading && categories.length === 0}
                    onSelect={selectCategory}
                />
            )}

            {isError ? (
                <p className={Styles.picker__state}>Не удалось загрузить варианты цели.</p>
            ) : isLoading ? (
                <p className={Styles.picker__state}>Ищем подходящие товары…</p>
            ) : searchMode === 'category' && !categoryId ? (
                <p className={Styles.picker__state}>Выберите категорию, чтобы увидеть товары.</p>
            ) : targetProducts.length === 0 ? (
                <p className={Styles.picker__state}>По этому запросу ничего не найдено.</p>
            ) : (
                <div className={Styles.picker__grid}>
                    {targetProducts.map((product) => (
                        <button
                            key={product.product_id}
                            type="button"
                            className={`${Styles.picker__target} ${
                                value === product.product_id ? Styles['picker__target--selected'] : ''
                            }`}
                            aria-pressed={value === product.product_id}
                            disabled={disabled}
                            onClick={() => onChange(product.product_id)}
                        >
                            <span className={Styles.picker__media}>
                                <ProductImage src={product.image} alt="" title={product.title} />
                            </span>
                            <span className={Styles.picker__body}>
                                <strong>{product.title}</strong>
                                <small>{getProductMeta(product) || 'Можно предложить обмен'}</small>
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
};
