import { formatDate } from '@shared/lib';
import type { TChainMessage } from '../../types/chain';

import Styles from './MessageList.module.css';

type TMessageListProps = {
    messages: TChainMessage[];
    currentCustomerId?: string;
    className?: string;
};

export const MessageList = ({ messages, currentCustomerId, className }: TMessageListProps) => {
    const listClasses = [Styles['message-list'], className].filter(Boolean).join(' ');

    if (messages.length === 0) {
        return (
            <ul className={listClasses}>
                <li className={Styles['message-list__empty']}>Сообщений пока нет</li>
            </ul>
        );
    }

    return (
        <ul className={listClasses}>
            {messages.map((message) => {
                const isOwn = message.customer_id === currentCustomerId;

                const itemClasses = [
                    Styles['message-item'],
                    isOwn ? Styles['message-item--own'] : Styles['message-item--incoming'],
                ]
                    .filter(Boolean)
                    .join(' ');

                const bubbleClasses = [
                    Styles['message-item__bubble'],
                    isOwn
                        ? Styles['message-item__bubble--own']
                        : Styles['message-item__bubble--incoming'],
                ]
                    .filter(Boolean)
                    .join(' ');

                return (
                    <li className={itemClasses} key={message.message_id}>
                        <div className={bubbleClasses}>{message.body}</div>
                        <time className={Styles['message-item__time']}>
                            {formatDate(message.created_at, 'short')}
                        </time>
                    </li>
                );
            })}
        </ul>
    );
};
