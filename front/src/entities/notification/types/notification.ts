import type {TChainStatus} from '@entities/chain';

/**
 * Тип события уведомления. Определяется ролью текущего пользователя
 * в сделке и её статусом — см. buildNotifications.
 */
export type TNotificationKind =
    /** Входящее предложение обмена, ожидающее моего ответа (pending/countered). */
    | 'incoming_offer'
    /** Моё исходящее предложение, ждёт ответа второй стороны. */
    | 'outgoing_pending'
    /** Сделка в активной стадии — обсуждаются детали. */
    | 'in_progress'
    /** Сделка завершена (любой терминальный статус). */
    | 'finished';

/**
 * Виртуальное уведомление, вычисляемое из состояния сделки (chain).
 * Не хранится на бэке — это производная лента активности пользователя.
 */
export type TNotification = {
    /** Стабильный идентификатор: `<chain_id>:<kind>`. */
    id: string;
    kind: TNotificationKind;
    /** Идентификатор сделки, к которой относится событие. */
    chain_id: string;
    /** Короткий заголовок события. */
    title: string;
    /** Поясняющий текст. */
    body: string;
    /** Статус сделки на момент события. */
    status: TChainStatus;
    /** ISO-дата последнего обновления сделки (для сортировки). */
    updated_at: string;
    /** Куда вести пользователя при клике. */
    href: string;
    /** Время прочтения; null означает, что уведомление ещё не прочитано. */
    read_at: string | null;
};

export type TNotificationRead = {
    chain_id: string;
    kind: TNotificationKind;
    read_at: string;
};
