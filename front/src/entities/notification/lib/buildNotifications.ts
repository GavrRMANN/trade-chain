import type {TChain, TChainStatus} from '@entities/chain';
import type {TProduct} from '@entities/product';
import type {TNotification, TNotificationKind} from '../types';

function assertNever(x: never, hint?: string): never {
    throw new Error(
        `Unhandled variant${hint ? ` in ${hint}` : ''}: ${JSON.stringify(x)}`,
    );
}

/** Терминальные статусы сделки — обмен больше не активен. */
const FINAL_STATUSES: ReadonlySet<TChainStatus> = new Set<TChainStatus>([
    'completed',
    'cancelled',
    'rejected',
    'failed',
    'expired',
    'unavailable',
]);

/**
 * По сделке и роли текущего пользователя определяет тип события.
 * Роль восстанавливается по initiator_id (поля recipient_id во фронтовом типе нет).
 */
const resolveKind = (chain: TChain, currentUserId: string): TNotificationKind | null => {
    const isIncoming = chain.initiator_id !== currentUserId;

    if ((chain.status === 'pending' || chain.status === 'countered') && isIncoming) {
        return 'incoming_offer';
    }
    if ((chain.status === 'pending' || chain.status === 'countered') && !isIncoming) {
        return 'outgoing_pending';
    }
    if (chain.status === 'active') {
        return 'in_progress';
    }
    if (FINAL_STATUSES.has(chain.status)) {
        return 'finished';
    }
    return null;
};

/** Человекочитаемое название товара или заглушка, если он недоступен. */
const productLabel = (product?: TProduct): string =>
    product ? product.title : 'Товар недоступен';

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
