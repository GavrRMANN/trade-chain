import {NavLink} from 'react-router-dom';

import {useNotificationsFeed} from '@entities/notification';

import Styles from './notification-bell.module.css';

/**
 * Кнопка-уведомления в шапке: ведёт на центр уведомлений и показывает
 * бейдж с числом предложений, ожидающих ответа. Для гостей бейдж скрыт.
 */
export const NotificationBell = () => {
    const {isAuthenticated, unreadCount} = useNotificationsFeed();

    const classes = [
        Styles['notification-bell'],
        isAuthenticated && Styles['notification-bell--authed'],
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <NavLink
            className={classes}
            to="/notifications"
            aria-label={
                unreadCount > 0
                    ? `Уведомления, новых: ${unreadCount}`
                    : 'Уведомления'
            }
        >
            <span className={Styles['notification-bell__label']}>Уведомления</span>
            {isAuthenticated && unreadCount > 0 && (
                <span
                    className={Styles['notification-bell__badge']}
                    aria-hidden="true"
                >
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </NavLink>
    );
};
