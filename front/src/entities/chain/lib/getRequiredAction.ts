import {assertNever} from '@shared/lib';

import type {TChain, TChainConfirmation} from '../types';

/** Кто должен сделать следующий шаг. */
export type TRequiredActor = 'you' | 'partner';

export type TRequiredAction = {
    /** Что требуется сделать, человеческим языком. */
    text: string;
    /** От кого сейчас ждут действия — определяет акцент в интерфейсе. */
    actor: TRequiredActor;
};

type TGetRequiredActionParams = {
    chain: TChain;
    /** Текущий пользователь: одна и та же цепочка выглядит по-разному с двух сторон. */
    currentUserId?: string;
    /** Подтверждения результата, если они уже загружены комнатой обмена. */
    confirmations?: TChainConfirmation[];
};

/**
 * Переводит технический статус цепочки в понятное требование к пользователю.
 *
 * Статус сам по себе ничего не говорит о следующем шаге: «pending» одинаково
 * выглядит и для того, кто ждёт ответа, и для того, кто должен ответить.
 * Новых правил обработки обменов эта функция не вводит — только объясняет
 * уже существующее состояние.
 */
export const getRequiredAction = ({
    chain,
    currentUserId,
    confirmations,
}: TGetRequiredActionParams): TRequiredAction => {
    const isInitiator = Boolean(currentUserId) && chain.initiator_id === currentUserId;
    const hasConfirmed = Boolean(
        currentUserId &&
        confirmations?.some((confirmation) => confirmation.customer_id === currentUserId),
    );

    switch (chain.status) {
        case 'pending':
            return isInitiator
                ? {
                      text: chain.expires_at
                          ? `Владелец должен ответить до ${formatDeadline(chain.expires_at)}`
                          : 'Ждём ответа владельца',
                      actor: 'partner',
                  }
                : { text: 'Ответьте на предложение: принять или отклонить', actor: 'you' };

        /* Встречное предложение — отдельное звено, а это на сервере уже
           закрыто. Обещать здесь ответ значит вести к кнопке, которая
           отвечает «обмен уже завершён». */
        case 'countered':
            return isInitiator
                ? { text: 'Вам предложили другие условия — они пришли отдельным обменом', actor: 'you' }
                : { text: 'Предложение закрыто встречным', actor: 'you' };

        case 'active':
            if (hasConfirmed) {
                return { text: 'Ждём подтверждения второго участника', actor: 'partner' };
            }

            return confirmations && confirmations.length > 0
                ? { text: 'Подтвердите, состоялся ли обмен', actor: 'you' }
                : { text: 'Согласуйте место и время встречи', actor: 'you' };

        case 'completed':
            return { text: 'Обмен завершён. Оставьте отзыв', actor: 'you' };

        case 'rejected':
            return { text: 'Предложение закрыто. Подобрать другой вариант', actor: 'you' };

        case 'cancelled':
            return { text: 'Предложение отменено. Подобрать другой вариант', actor: 'you' };

        case 'expired':
            return { text: 'Срок ответа истёк. Подобрать другой вариант', actor: 'you' };

        case 'failed':
            return {
                text: 'Обмен не состоялся. Маршрут можно продолжить с тем же товаром',
                actor: 'you',
            };

        case 'unavailable':
            return { text: 'Товар ушёл в другой обмен. Перестроить маршрут', actor: 'you' };

        default:
            return assertNever(chain.status, 'getRequiredAction');
    }
};

/** Срок ответа в коротком виде: «12 августа, 14:30». */
const formatDeadline = (value: string): string => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
    });
};
