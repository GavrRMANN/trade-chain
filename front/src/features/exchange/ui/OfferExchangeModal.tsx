import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Modal } from '@shared/ui/modal';
import { Preloader } from '@shared/ui/preloader';
import { ProductPickerGrid } from '@shared/ui/productPicker';
import type { TRouteContext } from '@entities/chain';
import { QuickProductForm } from '@features/productForm';

import Styles from './offer-exchange-modal.module.css';
import { STANDALONE_GOAL_VALUE, useOfferExchangeForm } from './useOfferExchangeForm';

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
    /**
     * Маршрут, в рамках которого делается предложение. Передаётся, когда
     * форма открыта из «Пути к цели» или из ленты под конкретную цель:
     * без него предложение уходит самостоятельной цепочкой и маршрут
     * не продолжается.
     */
    routeContext?: TRouteContext;
    /**
     * Переход на полную форму создания объявления. Вызывающий обязан
     * сохранить точку возврата к цели — иначе пользователь потеряет товар,
     * ради которого начал сценарий.
     */
    onCreateFullProduct?: () => void;
};

export const OfferExchangeModal = ({
    isOpen,
    onClose,
    onSuccess,
    targetProductId,
    currentCustomerId,
    routeContext,
    onCreateFullProduct,
}: TOfferExchangeModalProps) => {
    const {
        myProducts,
        isProductsLoading,
        isCreating,
        categories,
        isQuickFormOpen,
        openQuickForm,
        closeQuickForm,
        handleQuickProductCreated,
        selectedProductId,
        message,
        requestError,
        canSubmit,
        goals,
        isGoalsLoading,
        selectedGoalId,
        boundGoalTitle,
        isGoalLocked,
        setSelectedProductId,
        setMessage,
        setSelectedGoalId,
        handleSubmit,
    } = useOfferExchangeForm({
        isOpen,
        targetProductId,
        currentCustomerId,
        routeContext,
        onSuccess,
        onClose,
    });

    return (
        <Modal title="Предложить обмен" isOpen={isOpen} onClose={onClose}>
            <form className={Styles.form} onSubmit={handleSubmit} noValidate>
                <section className={Styles['form__section']}>
                    <h3 className={Styles['form__section-title']}>Выберите ваш товар</h3>
                    {isProductsLoading ? (
                        <Preloader message="Загружаем ваши вещи…" />
                    ) : myProducts.length === 0 ? (
                        /* Пустой профиль не должен упираться в сообщение «вещей нет»:
                           уход на полную форму терял бы выбранную цель. */
                        isQuickFormOpen ? (
                            <QuickProductForm
                                categories={categories}
                                customerId={currentCustomerId}
                                onCreated={handleQuickProductCreated}
                                onCancel={closeQuickForm}
                            />
                        ) : (
                            <div className={Styles['form__empty-state']}>
                                <p className={Styles['form__empty']}>
                                    У вас пока нет вещей для обмена — опишите вещь, и предложение
                                    отправится этому же владельцу.
                                </p>
                                <div className={Styles['form__empty-actions']}>
                                    <Button type="button" onClick={openQuickForm}>
                                        Быстро добавить вещь
                                    </Button>
                                    {onCreateFullProduct && (
                                        <Button
                                            type="button"
                                            variant="text"
                                            onClick={onCreateFullProduct}
                                        >
                                            Создать полное объявление
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )
                    ) : (
                        <ProductPickerGrid
                            products={myProducts}
                            selectedProductId={selectedProductId}
                            onSelect={setSelectedProductId}
                        />
                    )}
                </section>

                {/* Привязка к маршруту — не украшение: без неё бэкенд создаёт
                    самостоятельную цепочку, и пройденные шаги к цели теряются. */}
                {isGoalLocked ? (
                    <section className={Styles['form__goal-summary']}>
                        <span className={Styles['form__goal-summary-label']}>
                            Обмен засчитывается в маршрут
                        </span>
                        <strong className={Styles['form__goal-summary-title']}>
                            {boundGoalTitle ?? 'Путь к цели'}
                        </strong>
                    </section>
                ) : (
                    goals.length > 0 && (
                        <section className={Styles['form__section']}>
                            <h3 className={Styles['form__section-title']}>Куда засчитать обмен</h3>
                            <div
                                className={Styles['form__goals']}
                                role="radiogroup"
                                aria-label="Куда засчитать обмен"
                            >
                                <label className={Styles['form__goal']}>
                                    <input
                                        type="radio"
                                        name="offer-goal"
                                        value={STANDALONE_GOAL_VALUE}
                                        checked={selectedGoalId === STANDALONE_GOAL_VALUE}
                                        onChange={() => setSelectedGoalId(STANDALONE_GOAL_VALUE)}
                                        disabled={isCreating}
                                    />
                                    <span className={Styles['form__goal-body']}>
                                        <span className={Styles['form__goal-title']}>
                                            Отдельный обмен
                                        </span>
                                        <span className={Styles['form__goal-meta']}>
                                            Не связан с вашими маршрутами
                                        </span>
                                    </span>
                                </label>

                                {goals.map((goal) => (
                                    <label key={goal.goalId} className={Styles['form__goal']}>
                                        <input
                                            type="radio"
                                            name="offer-goal"
                                            value={goal.goalId}
                                            checked={selectedGoalId === goal.goalId}
                                            onChange={() => setSelectedGoalId(goal.goalId)}
                                            disabled={isCreating}
                                        />
                                        <span className={Styles['form__goal-body']}>
                                            <span className={Styles['form__goal-title']}>
                                                Маршрут к «{goal.goalTitle}»
                                            </span>
                                            {/* Цель и текущий товар вместе: они не дают
                                                привязать предложение к чужому маршруту. */}
                                            <span className={Styles['form__goal-meta']}>
                                                {goal.currentProductTitle
                                                    ? `Сейчас у вас: ${goal.currentProductTitle}`
                                                    : 'Текущий товар не определён'}
                                                {goal.openOffersCount > 0 &&
                                                    ` · в работе: ${goal.openOffersCount}`}
                                            </span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </section>
                    )
                )}

                {!isGoalLocked && isGoalsLoading && goals.length === 0 && (
                    <p className={Styles['form__goals-loading']}>Проверяем ваши маршруты…</p>
                )}

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
