import { useExchangeRoom } from '../lib';

import { Button } from '@shared/ui/button';
import { MainSection } from '@shared/ui/mainSection';
import { MessageInput } from '@shared/ui/messageInput';
import { MessageList } from '@entities/chain';
import { PageError } from '@shared/ui/pageError';
import { PageHeader } from '@shared/ui/pageHeader';
import { Preloader } from '@shared/ui/preloader';
import { ProductCard } from '@entities/product';
import { ChainStatusBadge } from '@entities/chain';
import { Textarea } from '@shared/ui/textarea';
import { formatDate } from '@shared/lib';

import StarSVG from '@shared/assets/icons/Star.svg?react';

import Styles from './exchange-room.module.css';

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

export const ExchangeRoomPage = () => {
    const {
        chain,
        currentUserId,
        isInitiator,
        fromProduct,
        toProduct,
        messages,
        isLoading,
        isError,
        isPendingLike,
        isActive,
        isCompleted,
        isUnavailable,
        isWaitingForOtherConfirmation,
        openProduct,
        messageDraft,
        setMessageDraft,
        handleSendMessage,
        isMessageSending,
        messageError,
        handleChangeStatus,
        handleConfirm,
        isActionLoading,
        statusError,
        rating,
        setRating,
        comment,
        setComment,
        handleSendReview,
        isReviewCreating,
        reviewError,
        isReviewSent,
    } = useExchangeRoom();

    if (isLoading) {
        return <Preloader message={'Загружаем сделку…'} />;
    }

    if (isError || !chain) {
        return <PageError message={'Не удалось загрузить сделку'} />;
    }

    return (
        <MainSection>
            {/* Статус сделки закреплён: страница длинная (товары, чат, отзыв),
                а от статуса зависит, что вообще можно здесь сделать. */}
            <PageHeader
                title="Сделка обмена"
                meta={
                    <>
                        <ChainStatusBadge status={chain.status} />
                        <span>Создано: {formatDate(chain.created_at)}</span>
                    </>
                }
            />

            <div className={Styles.page}>
                <section className={Styles.products} aria-label="Товары обмена">
                    <div className={Styles.product}>
                        {fromProduct ? (
                            <ProductCard
                                title={fromProduct.title}
                                img={fromProduct.image}
                                price={fromProduct.price}
                                location={fromProduct.location}
                                variant="horizontal"
                                onClick={() => openProduct(fromProduct.product_id)}
                            />
                        ) : (
                            <p className={Styles['product-empty']}>Товар недоступен</p>
                        )}
                    </div>
                    <span className={Styles['products__arrow']} aria-hidden="true">→</span>
                    <div className={Styles.product}>
                        {toProduct ? (
                            <ProductCard
                                title={toProduct.title}
                                img={toProduct.image}
                                price={toProduct.price}
                                location={toProduct.location}
                                variant="horizontal"
                                onClick={() => openProduct(toProduct.product_id)}
                            />
                        ) : (
                            <p className={Styles['product-empty']}>Товар недоступен</p>
                        )}
                    </div>
                </section>

                <section className={Styles.section} aria-label="Действия по сделке">
                    <h2 className={Styles['section__title']}>Действия</h2>

                    {isPendingLike && (
                        <div className={Styles.actions}>
                            {isInitiator ? (
                                <Button
                                    variant="secondary"
                                    loading={isActionLoading}
                                    disabled={isActionLoading}
                                    onClick={() => handleChangeStatus('cancelled')}
                                >
                                    Отменить предложение
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        loading={isActionLoading}
                                        disabled={isActionLoading}
                                        onClick={() => handleChangeStatus('active')}
                                    >
                                        Принять
                                    </Button>
                                    <Button
                                        variant="text"
                                        loading={isActionLoading}
                                        disabled={isActionLoading}
                                        onClick={() => handleChangeStatus('rejected')}
                                    >
                                        Отклонить
                                    </Button>
                                </>
                            )}
                        </div>
                    )}

                    {isWaitingForOtherConfirmation && (
                        <p className={Styles['actions__note']}>
                            Вы подтвердили, что обмен состоялся. Ожидаем подтверждение второй стороны.
                        </p>
                    )}

                    {isActive && !isWaitingForOtherConfirmation && (
                        <div className={Styles.actions}>
                            <Button
                                loading={isActionLoading}
                                disabled={isActionLoading}
                                onClick={() => handleConfirm(true)}
                            >
                                Обмен состоялся
                            </Button>
                            <Button
                                variant="secondary"
                                loading={isActionLoading}
                                disabled={isActionLoading}
                                onClick={() => handleConfirm(false)}
                            >
                                Не договорились
                            </Button>
                        </div>
                    )}

                    {!isPendingLike && !isActive && (
                        <p className={Styles['actions__note']}>
                            {isUnavailable
                                ? 'Товар уже недоступен: он участвует в другом завершённом обмене.'
                                : 'Сделка завершена, действия недоступны.'}
                        </p>
                    )}

                    {statusError && <p className={Styles['status-error']}>{statusError}</p>}
                </section>

                <section className={Styles.section} aria-label="Переписка по сделке">
                    <h2 className={Styles['section__title']}>Чат</h2>
                    <div className={Styles.chat}>
                        <div className={Styles['chat__messages']}>
                            <MessageList messages={messages} currentCustomerId={currentUserId} />
                        </div>
                        {messageError && <p className={Styles['message-error']}>{messageError}</p>}
                        <MessageInput
                            value={messageDraft}
                            onChange={setMessageDraft}
                            onSend={handleSendMessage}
                            loading={isMessageSending}
                            placeholder="Напишите сообщение участнику сделки…"
                        />
                    </div>
                </section>

                {isCompleted && (
                    <section className={Styles.section} aria-label="Отзыв о сделке">
                        <h2 className={Styles['section__title']}>Оставить отзыв</h2>
                        {isReviewSent ? (
                            <p className={Styles['review__success']}>Спасибо за отзыв</p>
                        ) : (
                            <form
                                className={Styles.review}
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    handleSendReview();
                                }}
                                noValidate
                            >
                                <div className={Styles.stars} role="radiogroup" aria-label="Оценка">
                                    {STAR_VALUES.map((value) => {
                                        const filled = value <= rating;
                                        const starClasses = [
                                            Styles.star,
                                            filled && Styles['star--filled'],
                                        ]
                                            .filter(Boolean)
                                            .join(' ');
                                        return (
                                            <button
                                                key={value}
                                                type="button"
                                                className={starClasses}
                                                onClick={() => setRating(value)}
                                                aria-label={`${value} из 5`}
                                                aria-pressed={filled}
                                                disabled={isReviewCreating}
                                            >
                                                <StarSVG />
                                            </button>
                                        );
                                    })}
                                </div>
                                <Textarea
                                    label="Комментарий"
                                    name="comment"
                                    value={comment}
                                    placeholder="Расскажите, как прошла сделка"
                                    onChange={setComment}
                                    disabled={isReviewCreating}
                                />
                                {reviewError && (
                                    <p className={Styles['review-error']}>{reviewError}</p>
                                )}
                                <Button
                                    type="submit"
                                    loading={isReviewCreating}
                                    disabled={rating < 1 || isReviewCreating}
                                >
                                    Отправить отзыв
                                </Button>
                            </form>
                        )}
                    </section>
                )}
            </div>
        </MainSection>
    );
};
