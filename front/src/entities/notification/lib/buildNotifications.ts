import { FINAL_CHAIN_STATUSES } from '@entities/chain';
import type { TChain } from '@entities/chain';
import type { TProduct } from '@entities/product';
import { assertNever } from '@shared/lib';
import type { TNotification, TNotificationKind } from '../types';

/**
 * По сделке и роли текущего пользователя определяет тип события.
 * Роль восстанавливается по initiator_id (поля recipient_id во фронтовом типе нет).
 *
 * Список терминальных статусов берётся из сущности обмена, а не повторяется
 * здесь: своя копия успела разойтись с оригиналом и пропустила `countered`,
 * из-за чего закрытое встречным предложение звало ответить на себя.
 */
const resolveKind = (chain: TChain, currentUserId: string): TNotificationKind | null => {
    const isIncoming = chain.initiator_id !== currentUserId;

    if (FINAL_CHAIN_STATUSES.has(chain.status)) {
        return 'finished';
    }
    if (chain.status === 'pending') {
        return isIncoming ? 'incoming_offer' : 'outgoing_pending';
    }
    if (chain.status === 'active') {
        return 'in_progress';
    }
    return null;
};

/** Человекочитаемое название товара или заглушка, если он недоступен. */
const productLabel = (product?: TProduct): string => (product ? product.title : 'Товар недоступен');

/**
 * Превращает сделки пользователя в ленту уведомлений.
 *
 * Каждой сделке соответствует ровно одно событие, отражающее её текущее
 * состояние с позиции текущего пользователя. Никаких обращений к бэку —
 * только производные данные из уже загруженных сделок и товаров.
 */
export const buildNotifications = (
    chains: TChain[],
    productsById: Map<string, TProduct>,
    currentUserId: string,
): TNotification[] => {
    const notifications: TNotification[] = [];

    for (const chain of chains) {
        const kind = resolveKind(chain, currentUserId);
        if (!kind) {
            continue;
        }

        const fromProduct = productsById.get(chain.from_product_id);
        const toProduct = chain.to_product_id ? productsById.get(chain.to_product_id) : undefined;
        const href = `/exchanges/${chain.chain_id}`;

        const notification = {
            id: `${chain.chain_id}:${kind}`,
            kind,
            chain_id: chain.chain_id,
            status: chain.status,
            updated_at: chain.updated_at,
            href,
            read_at: null,
            ...describe(kind, fromProduct, toProduct),
        } satisfies TNotification;

        notifications.push(notification);
    }

    // Свежие события — наверх.
    return notifications.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
};

/** Тексты для каждого типа события. */
const describe = (
    kind: TNotificationKind,
    fromProduct: TProduct | undefined,
    toProduct: TProduct | undefined,
): Pick<TNotification, 'title' | 'body'> => {
    const from = productLabel(fromProduct);
    const to = productLabel(toProduct);

    switch (kind) {
        case 'incoming_offer':
            return {
                title: 'Новое предложение обмена',
                body: `Вам предлагают обмен: «${from}» → «${to}». Ждёт вашего ответа.`,
            };
        case 'outgoing_pending':
            return {
                title: 'Предложение отправлено',
                body: `«${from}» → «${to}». Ожидаем ответа второй стороны.`,
            };
        case 'in_progress':
            return {
                title: 'Обмен в работе',
                body: `«${from}» → «${to}». Договаривайтесь о деталях в чате.`,
            };
        case 'finished':
            return {
                title: 'Обмен завершён',
                body: `«${from}» → «${to}». Сделка больше не активна.`,
            };
        default:
            return assertNever(kind, 'describe');
    }
};
