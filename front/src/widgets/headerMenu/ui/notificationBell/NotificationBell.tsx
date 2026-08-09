import {NavLink} from 'react-router-dom';

import {useNotificationsFeed} from '@entities/notification';

import Styles from './notification-bell.module.css';

type TNotificationBellProps = {
    compact?: boolean;
    className?: string;
    activeClassName?: string;
};

const BellIcon = () => (
    <svg className={Styles['notification-bell__icon']} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 9A6 6 0 0 0 6 9c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </svg>
);

/**
 * Кнопка-уведомления в шапке: ведёт на центр уведомлений и показывает
 * бейдж с числом предложений, ожидающих ответа. Для гостей бейдж скрыт.
 */
export const NotificationBell = ({
    compact = false,
    className,
    activeClassName,
}: TNotificationBellProps) => {
    const {isAuthenticated, unreadCount} = useNotificationsFeed();

    const classes = [
        Styles['notification-bell'],
        compact && Styles['notification-bell--compact'],
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <NavLink
            className={({isActive}) => [
                classes,
                isActive && (activeClassName ?? Styles['notification-bell--active']),
            ].filter(Boolean).join(' ')}
            to="/notifications"
            aria-label={
                unreadCount > 0
                    ? `Уведомления, новых: ${unreadCount}`
                    : 'Уведомления'
            }
        >
            {compact ? <BellIcon /> : <span className={Styles['notification-bell__label']}>Уведомления</span>}
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
