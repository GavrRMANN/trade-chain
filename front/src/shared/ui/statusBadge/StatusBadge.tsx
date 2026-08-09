import Styles from './StatusBadge.module.css';

export type TStatusBadgeStatus =
    | 'pending'
    | 'active'
    | 'completed'
    | 'cancelled'
    | 'rejected'
    | 'countered'
    | 'failed'
    | 'expired'
    | 'reserved'
    | 'exchanged'
    | 'archived';

export type TStatusBadgeTone =
    | 'pending'
    | 'active'
    | 'completed'
    | 'negative'
    | 'warning'
    | 'muted';

export const statusTone: Record<TStatusBadgeStatus, TStatusBadgeTone> = {
    pending: 'pending',
    active: 'active',
    completed: 'completed',
    cancelled: 'negative',
    rejected: 'negative',
    failed: 'negative',
    expired: 'negative',
    countered: 'warning',
    reserved: 'muted',
    exchanged: 'muted',
    archived: 'muted',
};

export const statusLabels: Record<TStatusBadgeStatus, string> = {
    pending: 'Ожидает',
    active: 'Идёт обмен',
    completed: 'Завершён',
    cancelled: 'Отменён',
    rejected: 'Отклонён',
    countered: 'Встречное',
    failed: 'Не состоялся',
    expired: 'Просрочен',
    reserved: 'Зарезервирован',
    exchanged: 'Обменян',
    archived: 'В архиве',
};

type TStatusBadgeProps = {
    status: TStatusBadgeStatus;
    className?: string;
};

export const StatusBadge = ({status, className}: TStatusBadgeProps) => {
    const classes = [
        Styles['status-badge'],
        Styles[`status-badge--${statusTone[status]}`],
        className,
    ].filter(Boolean).join(' ');

    return (
        <span className={classes}>
            {statusLabels[status]}
        </span>
    );
};
