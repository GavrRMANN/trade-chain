import { useState } from 'react';

import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { ProductImage } from '@entities/product';
import { Selector } from '@shared/ui/selector';

import { getProductMeta, useRouteBuilder } from '../lib/useRouteBuilder';
import Styles from './route-builder.module.css';

type TRouteBuilderProps = {
    onCancel?: () => void;
    variant?: 'card' | 'modal';
};

export const RouteBuilder = ({ onCancel, variant = 'card' }: TRouteBuilderProps) => {
    const [mobileStep, setMobileStep] = useState<1 | 2>(1);
    const {
        sourceProducts,
        targetProducts,
        categories,
        sourceId,
        targetId,
        selectedSource,
        selectedTarget,
        searchMode,
        searchValue,
        categoryId,
        isSourcesLoading,
        isTargetsLoading,
        hasTargetError,
        setSourceId,
        setTargetId,
        selectMode,
        selectCategory,
        search,
        buildRoute,
    } = useRouteBuilder();

    const categoryOptions = [
        { value: '', label: 'Выберите категорию' },
        ...categories.map((category) => ({
            value: category.category_id,
            label: category.name,
        })),
    ];

    return (
        <section
            className={`${Styles.builder} ${Styles[`builder--${variant}`]}`}
            aria-labelledby="route-builder-title"
        >
            <div className={Styles.builder__heading}>
                <div>
                    <span className={Styles.builder__eyebrow}>
                        <span className={Styles.builder__desktopEyebrow}>Новая цепочка</span>
                        <span className={Styles.builder__mobileEyebrow}>
                            Шаг {mobileStep} из 2
                        </span>
                    </span>
                    <h2 id="route-builder-title">Постройте путь к нужной вещи</h2>
                    <p>Выберите, с чего начинаете и к какой цели хотите прийти.</p>
                </div>
                <div className={Styles.builder__miniPath} aria-hidden="true">
                    <span />
                    <i>→</i>
                    <span />
                    <i>→</i>
                    <b>★</b>
                </div>
            </div>

            <div className={Styles.builder__steps}>
                <div
                    className={`${Styles.builder__step} ${
                        mobileStep !== 1 ? Styles['builder__step--mobile-hidden'] : ''
                    }`}
                >
                    <div className={Styles.builder__stepHeading}>
                        <span>1</span>
                        <div>
                            <h3>С чего начинаем</h3>
                            <p>Ваш текущий товар</p>
                        </div>
                    </div>

                    {isSourcesLoading ? (
                        <p className={Styles.builder__state}>Загружаем ваши товары…</p>
                    ) : sourceProducts.length === 0 ? (
                        <p className={Styles.builder__state}>
                            Нет активных товаров. Сначала добавьте объявление.
                        </p>
                    ) : (
                        <div className={Styles.builder__sourceList}>
                            {sourceProducts.map((product) => (
                                <button
                                    key={product.product_id}
                                    type="button"
                                    className={`${Styles.builder__product} ${
                                        sourceId === product.product_id
                                            ? Styles['builder__product--selected']
                                            : ''
                                    }`}
                                    aria-pressed={sourceId === product.product_id}
                                    onClick={() => setSourceId(product.product_id)}
                                >
                                    <span className={Styles.builder__productMedia}>
                                        <ProductImage
                                            src={product.image}
                                            alt=""
                                            title={product.title}
                                        />
                                    </span>
                                    <span className={Styles.builder__productBody}>
                                        <strong>{product.title}</strong>
                                        <small>{getProductMeta(product) || 'Активное объявление'}</small>
                                    </span>
                                    <span className={Styles.builder__check} aria-hidden="true">✓</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div
                    className={`${Styles.builder__connector} ${
                        mobileStep !== 1 ? Styles['builder__connector--mobile-hidden'] : ''
                    }`}
                    aria-hidden="true"
                >
                    <span>→</span>
                </div>

                <div
                    className={`${Styles.builder__step} ${
                        mobileStep !== 2 ? Styles['builder__step--mobile-hidden'] : ''
                    }`}
                >
                    <div className={Styles.builder__stepHeading}>
                        <span>2</span>
                        <div>
                            <h3>Куда хотим прийти</h3>
                            <p>Найдите товар или откройте категорию</p>
                        </div>
                    </div>

                    <div className={Styles.builder__mode} role="tablist" aria-label="Способ поиска цели">
                        <Button
                            variant="text"
                            active={searchMode === 'product'}
                            className={searchMode === 'product' ? Styles['builder__mode--active'] : ''}
                            onClick={() => selectMode('product')}
                        >
                            По товару
                        </Button>
                        <Button
                            variant="text"
                            active={searchMode === 'category'}
                            className={searchMode === 'category' ? Styles['builder__mode--active'] : ''}
                            onClick={() => selectMode('category')}
                        >
                            По категории
                        </Button>
                    </div>

                    <div className={Styles.builder__filter}>
                        {searchMode === 'product' ? (
                            <Input
                                value={searchValue}
                                placeholder="Например, iPhone 15"
                                onChange={search}
                            />
                        ) : (
                            <Selector
                                value={categoryId}
                                label="Категория цели"
                                options={categoryOptions}
                                onSelect={selectCategory}
                                loading={isTargetsLoading && categories.length === 0}
                            />
                        )}
                    </div>

                    {hasTargetError ? (
                        <p className={Styles.builder__state}>Не удалось загрузить варианты цели.</p>
                    ) : isTargetsLoading ? (
                        <p className={Styles.builder__state}>Ищем подходящие товары…</p>
                    ) : searchMode === 'category' && !categoryId ? (
                        <p className={Styles.builder__state}>Выберите категорию, чтобы увидеть товары.</p>
                    ) : targetProducts.length === 0 ? (
                        <p className={Styles.builder__state}>По этому запросу ничего не найдено.</p>
                    ) : (
                        <div className={Styles.builder__targetGrid}>
                            {targetProducts.map((product) => (
                                <button
                                    key={product.product_id}
                                    type="button"
                                    className={`${Styles.builder__target} ${
                                        targetId === product.product_id
                                            ? Styles['builder__target--selected']
                                            : ''
                                    }`}
                                    aria-pressed={targetId === product.product_id}
                                    onClick={() => setTargetId(product.product_id)}
                                >
                                    <span className={Styles.builder__targetMedia}>
                                        <ProductImage src={product.image} alt="" title={product.title} />
                                    </span>
                                    <span>
                                        <strong>{product.title}</strong>
                                        <small>{getProductMeta(product) || 'Можно предложить обмен'}</small>
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className={Styles.builder__footer}>
                <div className={Styles.builder__summary}>
                    <span>{selectedSource?.title ?? 'Выберите стартовый товар'}</span>
                    <b aria-hidden="true">→</b>
                    <span>{selectedTarget?.title ?? 'Выберите цель'}</span>
                </div>
                <div className={`${Styles.builder__actions} ${Styles.builder__desktopActions}`}>
                    {onCancel && (
                        <Button variant="text" onClick={onCancel}>
                            Отмена
                        </Button>
                    )}
                    <Button disabled={!sourceId || !targetId} onClick={buildRoute}>
                        Построить цепочку
                    </Button>
                </div>
                <div className={`${Styles.builder__actions} ${Styles.builder__mobileActions}`}>
                    {mobileStep === 1 ? (
                        <>
                            {onCancel && (
                                <Button variant="text" onClick={onCancel}>
                                    Отмена
                                </Button>
                            )}
                            <Button disabled={!sourceId} onClick={() => setMobileStep(2)}>
                                Продолжить
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="text" onClick={() => setMobileStep(1)}>
                                Назад
                            </Button>
                            <Button disabled={!targetId} onClick={buildRoute}>
                                Построить цепочку
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};
