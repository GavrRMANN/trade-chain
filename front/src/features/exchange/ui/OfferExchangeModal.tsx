import {Button} from '@shared/ui/button';
import {Input} from '@shared/ui/input';
import {Modal} from '@shared/ui/modal';
import {Preloader} from '@shared/ui/preloader';
import {ProductCard} from '@shared/ui/productCard';

import Styles from './offer-exchange-modal.module.css';
import {useOfferExchangeForm} from './useOfferExchangeForm';

type TOfferExchangeModalProps = {
    isOpen: boolean;
    onClose: () => void;
    /**
     * Вызывается после успешного создания предложения обмена.
     * Получает идентификатор созданной цепочки — например, чтобы
     * перевести пользователя в комнату обмена.
     */
    onSuccess?: (chainId: string) => void;
    targetProductId: string;
    currentCustomerId?: string;
};

export const OfferExchangeModal = ({
    isOpen,
    onClose,
    onSuccess,
    targetProductId,
    currentCustomerId,
}: TOfferExchangeModalProps) => {
    const {
        myProducts,
        isProductsLoading,
        isCreating,
        selectedProductId,
        message,
        requestError,
        canSubmit,
        setSelectedProductId,
        setMessage,
        handleSubmit,
    } = useOfferExchangeForm({
        isOpen,
        targetProductId,
        currentCustomerId,
        onSuccess,
        onClose,
    });

    return (
        <Modal
            title="Предложить обмен"
            isOpen={isOpen}
            onClose={onClose}
        >
            <form className={Styles.form} onSubmit={handleSubmit} noValidate>
                <section className={Styles['form__section']}>
                    <h3 className={Styles['form__section-title']}>Выберите ваш товар</h3>
                    {isProductsLoading ? (
                        <Preloader message="Загружаем ваши вещи…" />
                    ) : myProducts.length === 0 ? (
                        <p className={Styles['form__empty']}>
                            У вас пока нет вещей для обмена. Добавьте объявление, чтобы предложить обмен.
                        </p>
                    ) : (
                        <div className={Styles['form__products']}>
                            {myProducts.map((product) => (
                                <button
                                    key={product.product_id}
                                    type="button"
                                    className={[
                                        Styles['form__product'],
                                        selectedProductId === product.product_id &&
                                            Styles['form__product--selected'],
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                    onClick={() => setSelectedProductId(product.product_id)}
                                    aria-pressed={selectedProductId === product.product_id}
                                >
                                    <ProductCard
                                        title={product.title}
                                        img={product.image}
                                        price={product.price}
                                        location={product.location}
                                        variant="horizontal"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                <section className={Styles['form__section']}>
                    <Input
                        label="Сообщение продавцу"
                        name="message"
                        value={message}
                        placeholder="Например, готов встретиться в центре"
                        onChange={setMessage}
                        disabled={isCreating}
                    />
                </section>

                {requestError && <p className={Styles['form__error']}>{requestError}</p>}

                <Button type="submit" loading={isCreating} disabled={!canSubmit}>
                    Предложить обмен
                </Button>
            </form>
        </Modal>
    );
};
