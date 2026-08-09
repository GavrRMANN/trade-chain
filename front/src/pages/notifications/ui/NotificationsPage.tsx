import {MainSection} from '@shared/ui/mainSection';
import {Preloader} from '@shared/ui/preloader';
import {PageError} from '@shared/ui/pageError';
import {StatusBadge} from '@shared/ui/statusBadge';
import {Button} from '@shared/ui/button';
import {formatDate} from '@shared/lib';

import type {TNotification, TNotificationKind} from '@entities/notification';

import Styles from './notifications-page.module.css';
import {useNotificationsPage} from '../lib';

const KIND_LABEL: Record<TNotificationKind, string> = {
    incoming_offer: 'Новое предложение',
    outgoing_pending: 'Ждёт ответа',
    in_progress: 'В работе',
    finished: 'Завершено',
};

const NotificationRow = ({
    notification,
    onOpen,
}: {
    notification: TNotification;
    onOpen: (chainId: string) => void;
}) => {
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
        Styles['notifications-page__row'],
        requiresAction && Styles['notifications-page__row--accent'],
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
            <div className={Styles['notifications-page__row-body']}>
                <div className={Styles['notifications-page__row-head']}>
                    <span className={Styles['notifications-page__row-kind']}>
                        {KIND_LABEL[notification.kind]}
                    </span>
                    {requiresAction && (
                        <span className={Styles['notifications-page__row-dot']} aria-hidden="true" />
                    )}
                </div>
                <p className={Styles['notifications-page__row-title']}>{title}</p>
                <p className={Styles['notifications-page__row-text']}>{body}</p>
            </div>
            <div className={Styles['notifications-page__row-meta']}>
                <StatusBadge status={status} />
                <span className={Styles['notifications-page__row-date']}>
                    {formatDate(updated_at)}
                </span>
            </div>
        </div>
    );
};

export const NotificationsPage = () => {
    const {
        isAuthenticated,
        notifications,
        unreadCount,
        isLoading,
        isError,
        openExchange,
        openCatalog,
        openAuthModal,
    } = useNotificationsPage();

    if (!isAuthenticated) {
        return (
            <MainSection>
                <section className={Styles['notifications-page__guest']}>
                    <div>
                        <h2>Войдите, чтобы видеть уведомления</h2>
                        <p>
                            Здесь появляются предложения обмена, ответы второй
                            стороны и статусы ваших сделок.
                        </p>
                        <Button onClick={openAuthModal}>Войти</Button>
                    </div>
                </section>
            </MainSection>
        );
    }

    if (isLoading) {
        return <Preloader message={'Загружаем уведомления…'} />;
    }

    if (isError) {
        return <PageError message={'Не удалось загрузить уведомления'} />;
    }

    return (
        <MainSection>
            <div className={Styles['notifications-page']}>
                <header className={Styles['notifications-page__header']}>
                    {unreadCount > 0 && (
                        <span className={Styles['notifications-page__counter']}>
                            {unreadCount} ждёт ответа
                        </span>
                    )}
                </header>

                {notifications.length === 0 ? (
                    <div className={Styles['notifications-page__empty']}>
                        <h2>Пока пусто</h2>
                        <p>
                            Здесь будут отображаться предложения обмена и статусы
                            ваших сделок. Загляните в каталог, чтобы найти, что
                            предложить.
                        </p>
                        <Button onClick={openCatalog}>Перейти в каталог</Button>
                    </div>
                ) : (
                    <div className={Styles['notifications-page__list']}>
                        {notifications.map((notification) => (
                            <NotificationRow
                                key={notification.id}
                                notification={notification}
                                onOpen={openExchange}
                            />
                        ))}
                    </div>
                )}
            </div>
        </MainSection>
    );
};
