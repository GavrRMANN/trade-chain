import { Button } from '@shared/ui/button';
import { ProductImage } from '@entities/product';
import { TargetProductPicker } from '@entities/product';

import {useRouteBuilder} from '../lib/useRouteBuilder';
import Styles from './route-builder.module.css';
import {useMobileRouteStep} from './useMobileRouteStep';

type TRouteBuilderProps = {
    onCancel?: () => void;
    variant?: 'card' | 'modal';
};

export const RouteBuilder = ({ onCancel, variant = 'card' }: TRouteBuilderProps) => {
    const {mobileStep, goToNextStep, goToPreviousStep} = useMobileRouteStep();
    const {
        sourceProducts,
        products,
        categories,
        currentCustomerId,
        sourceId,
        targetGoal,
        selectedSource,
        targetLabel,
        sourceProductMeta,
        hasTarget,
        isSourcesLoading,
        isTargetsLoading,
        hasTargetError,
        setSourceId,
        setTargetGoal,
        buildRoute,
    } = useRouteBuilder();

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
                                        <small>{sourceProductMeta.get(product.product_id)}</small>
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
                    <TargetProductPicker
                        products={products}
                        categories={categories}
                        currentCustomerId={currentCustomerId}
                        value={targetGoal}
                        isLoading={isTargetsLoading}
                        isError={hasTargetError}
                        onChange={setTargetGoal}
                    />
                </div>
            </div>

            <div className={Styles.builder__footer}>
                <div className={Styles.builder__summary}>
                    <span>{selectedSource?.title ?? 'Выберите стартовый товар'}</span>
                    <b aria-hidden="true">→</b>
                    <span>{targetLabel}</span>
                </div>
                <div className={`${Styles.builder__actions} ${Styles.builder__desktopActions}`}>
                    {onCancel && (
                        <Button variant="text" onClick={onCancel}>
                            Отмена
                        </Button>
                    )}
                    <Button disabled={!sourceId || !hasTarget} onClick={buildRoute}>
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
                            <Button disabled={!sourceId} onClick={goToNextStep}>
                                Продолжить
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="text" onClick={goToPreviousStep}>
                                Назад
                            </Button>
                            <Button disabled={!hasTarget} onClick={buildRoute}>
                                Построить цепочку
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};
