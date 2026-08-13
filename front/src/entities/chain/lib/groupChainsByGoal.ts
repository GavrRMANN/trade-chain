import { getChainGoalId } from './chainGoal';
import type { TChain, TChainStatus } from '../types';

/** Статусы, считающиеся терминальными — обмен завершён и больше не активен. */
export const FINAL_CHAIN_STATUSES: ReadonlySet<TChainStatus> = new Set<TChainStatus>([
    'completed',
    'cancelled',
    'rejected',
    'failed',
    'expired',
    'unavailable',
]);

/**
 * Цель пользователя со всеми предложениями, которые к ней относятся.
 *
 * Несколько предложений к одной цели — не дубли, а конкурирующие варианты
 * одного шага, поэтому они собираются в одну запись со счётчиком.
 */
export type TChainGoalGroup = {
    /** Идентификатор цели: товар или категория. */
    goalId: string;
    /** Заполнено, когда цель задана категорией, а не конкретным товаром. */
    goalCategoryId?: string;
    /** Товар, который сейчас на руках: текущий этап маршрута. */
    sourceProductId: string;
    /** Последний завершённый шаг пути — связывает новое предложение с историей. */
    previousChainId?: string;
    /** Всего предложений по цели. */
    offersCount: number;
    /** Активные предложения — те, что ещё могут завершиться обменом. */
    openOffersCount: number;
    /** Завершённые обменом предложения. */
    completedOffersCount: number;
    /** Момент последнего изменения любой цепочки цели. */
    updatedAt: string;
};

/**
 * Группирует цепочки пользователя по конечной цели.
 *
 * Учитываются только цепочки, инициированные самим пользователем: чужое
 * входящее предложение не является его маршрутом. Цель берётся из
 * `exchange_goal_id`, а для старых цепочек без него — из товара или
 * категории назначения, иначе ранее созданные обмены выпали бы из списка.
 */
export const groupChainsByGoal = (chains: TChain[], currentUserId: string): TChainGoalGroup[] => {
    const groups = new Map<string, TChainGoalGroup>();
    /* Самый свежий завершённый шаг по каждой цели: именно он должен стать
       предыдущим шагом новой цепочки, а не первый встретившийся в выдаче. */
    const lastCompleted = new Map<string, TChain>();

    for (const chain of chains) {
        if (chain.initiator_id !== currentUserId) {
            continue;
        }

        /* Приняв товар назначения за цель, каждое предложение одного маршрута
           превращалось в отдельную цель, и путь к категории рассыпался на
           одиночные обмены, — порядок полей задан в {@link getChainGoalId}. */
        const goalId = getChainGoalId(chain);
        if (!goalId) {
            continue;
        }

        const goalCategoryId = goalId === chain.to_category_id ? chain.to_category_id : undefined;
        const isOpen = !FINAL_CHAIN_STATUSES.has(chain.status);
        const isCompleted = chain.status === 'completed';
        const sourceProductId = chain.route_step_id ?? chain.from_product_id;

        if (isCompleted) {
            const previous = lastCompleted.get(goalId);
            if (!previous || chain.updated_at > previous.updated_at) {
                lastCompleted.set(goalId, chain);
            }
        }

        const current = groups.get(goalId);

        if (!current) {
            groups.set(goalId, {
                goalId,
                goalCategoryId,
                sourceProductId,
                offersCount: 1,
                openOffersCount: isOpen ? 1 : 0,
                completedOffersCount: isCompleted ? 1 : 0,
                updatedAt: chain.updated_at,
            });
            continue;
        }

        current.offersCount += 1;
        current.openOffersCount += isOpen ? 1 : 0;
        current.completedOffersCount += isCompleted ? 1 : 0;

        // Текущий товар берётся из самой свежей цепочки: маршрут мог уйти
        // вперёд, и привязываться нужно к последнему этапу.
        if (chain.updated_at > current.updatedAt) {
            current.updatedAt = chain.updated_at;
            current.sourceProductId = sourceProductId;
        }
    }

    for (const group of groups.values()) {
        group.previousChainId = lastCompleted.get(group.goalId)?.chain_id;
    }

    return [...groups.values()].sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt),
    );
};
