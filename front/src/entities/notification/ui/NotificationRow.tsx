import { formatDate } from '@shared/lib';
import { ChainStatusBadge } from '@entities/chain';

import type { TNotification, TNotificationKind } from '../types';

import Styles from './notification-row.module.css';

const KIND_LABEL: Record<TNotificationKind, string> = {
    incoming_offer: 'Новое предложение',
    outgoing_pending: 'Ждёт ответа',
    in_progress: 'В работе',
    finished: 'Завершено',
};

type TNotificationRowProps = {
    notification: TNotification;
    onOpen: (notification: TNotification) => Promise<void>;
};

export const NotificationRow = ({ notification, onOpen }: TNotificationRowProps) => {
    const { title, body, status, updated_at } = notification;
    const isUnread = notification.read_at === null;

    const handleOpen = () => {
        void onOpen(notification);
    };

    const rowClasses = [Styles.row, isUnread && Styles['row--accent']].filter(Boolean).join(' ');

    return (
        <div className={rowClasses}>
            <button className={Styles.row__content} type="button" onClick={handleOpen}>
                <div className={Styles.row__body}>
                    <div className={Styles.row__head}>
                        <span className={Styles.row__kind}>{KIND_LABEL[notification.kind]}</span>
                        {isUnread && notification.kind === 'incoming_offer' && (
                            <span className={Styles.row__dot} aria-hidden="true" />
                        )}
                    </div>
                    <p className={Styles.row__title}>{title}</p>
                    <p className={Styles.row__text}>{body}</p>
                </div>
            </button>
            <div className={Styles.row__meta}>
                <ChainStatusBadge status={status} />
                <span className={Styles.row__date}>{formatDate(updated_at)}</span>
            </div>
        </div>
    );
};
