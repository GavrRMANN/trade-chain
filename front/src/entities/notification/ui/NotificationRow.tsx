import {formatDate} from '@shared/lib';
import {ChainStatusBadge} from '@entities/chain';

import type {TNotification, TNotificationKind} from '../types';

import Styles from './notification-row.module.css';

const KIND_LABEL: Record<TNotificationKind, string> = {
    incoming_offer: 'Новое предложение',
    outgoing_pending: 'Ждёт ответа',
    in_progress: 'В работе',
    finished: 'Завершено',
};

type TNotificationRowProps = {
    notification: TNotification;
    onOpen: (chainId: string) => void;
};

export const NotificationRow = ({notification, onOpen}: TNotificationRowProps) => {
    const {chain_id, title, body, status, updated_at} = notification;
    const requiresAction = notification.kind === 'incoming_offer';

    const handleOpen = () => onOpen(chain_id);
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onOpen(chain_id);
        }
    };

    const rowClasses = [
        Styles.row,
        requiresAction && Styles['row--accent'],
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div
            className={rowClasses}
            role="button"
            tabIndex={0}
            onClick={handleOpen}
            onKeyDown={handleKeyDown}
        >
            <div className={Styles.row__body}>
                <div className={Styles.row__head}>
                    <span className={Styles.row__kind}>
                        {KIND_LABEL[notification.kind]}
                    </span>
                    {requiresAction && (
                        <span className={Styles.row__dot} aria-hidden="true" />
                    )}
                </div>
                <p className={Styles.row__title}>{title}</p>
                <p className={Styles.row__text}>{body}</p>
            </div>
            <div className={Styles.row__meta}>
                <ChainStatusBadge status={status} />
                <span className={Styles.row__date}>
                    {formatDate(updated_at)}
                </span>
            </div>
        </div>
    );
};
