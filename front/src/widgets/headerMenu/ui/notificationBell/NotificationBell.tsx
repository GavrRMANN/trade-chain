import { NavLink } from 'react-router-dom';

import { useNotificationsFeed } from '@entities/notification';
import { BellIcon } from '@shared/ui/bellIcon';

import Styles from './notification-bell.module.css';

type TNotificationBellProps = {
    compact?: boolean;
    className?: string;
    activeClassName?: string;
};

/**
 * Кнопка-уведомления в шапке: ведёт на центр уведомлений и показывает
 * бейдж с числом предложений, ожидающих ответа. Для гостей бейдж скрыт.
 */
export const NotificationBell = ({
    compact = false,
    className,
    activeClassName,
}: TNotificationBellProps) => {
    const { isAuthenticated, unreadCount } = useNotificationsFeed();

    const classes = [
        Styles['notification-bell'],
        compact && Styles['notification-bell--compact'],
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <NavLink
            className={({ isActive }) =>
                [classes, isActive && (activeClassName ?? Styles['notification-bell--active'])]
                    .filter(Boolean)
                    .join(' ')
            }
            to="/notifications"
            aria-label={unreadCount > 0 ? `Уведомления, новых: ${unreadCount}` : 'Уведомления'}
        >
            {compact ? (
                <BellIcon className={Styles['notification-bell__icon']} />
            ) : (
                <span className={Styles['notification-bell__label']}>Уведомления</span>
            )}
            {isAuthenticated && unreadCount > 0 && (
                <span className={Styles['notification-bell__badge']} aria-hidden="true">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </NavLink>
    );
};
