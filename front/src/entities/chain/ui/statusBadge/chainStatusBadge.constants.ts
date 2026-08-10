import type { TChainStatusBadgeStatus, TChainStatusBadgeTone } from './ChainStatusBadge';

export const statusTone: Record<TChainStatusBadgeStatus, TChainStatusBadgeTone> = {
    pending: 'pending',
    active: 'active',
    completed: 'completed',
    cancelled: 'negative',
    rejected: 'negative',
    failed: 'negative',
    expired: 'negative',
    countered: 'warning',
    unavailable: 'negative',
};

export const statusLabels: Record<TChainStatusBadgeStatus, string> = {
    pending: 'Ожидает',
    active: 'Идёт обмен',
    completed: 'Завершён',
    cancelled: 'Отменён',
    rejected: 'Отклонён',
    countered: 'Встречное',
    failed: 'Не состоялся',
    expired: 'Просрочен',
    unavailable: 'Товар недоступен',
};
