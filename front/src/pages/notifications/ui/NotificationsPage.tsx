import {MainSection} from '@shared/ui/mainSection';
import {Preloader} from '@shared/ui/preloader';
import {PageError} from '@shared/ui/pageError';
import {PageHeader} from '@shared/ui/pageHeader';
import {Button} from '@shared/ui/button';
import {Pagination} from '@shared/ui/pagination';

import Styles from './notifications-page.module.css';
import {NotificationRow} from '@entities/notification';
import {useNotificationsPage, useNotificationsPagination} from '../lib';

export const NotificationsPage = () => {
    const {
        notifications,
        unreadCount,
        isLoading,
        isError,
        openExchange,
        openCatalog,
        markAllAsRead,
        isMarkingAllAsRead,
    } = useNotificationsPage();
    const {
        currentPage,
        itemsPerPage,
        listRef,
        paginationRef,
        setCurrentPage,
        totalPages,
    } = useNotificationsPagination(notifications.length);
    const paginatedNotifications = notifications.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    if (isLoading) {
        return <Preloader message={'Загружаем уведомления…'} />;
    }

    if (isError) {
        return <PageError message={'Не удалось загрузить уведомления'} />;
    }

    return (
        <MainSection fill>
            {/* Счётчик непрочитанного и «прочитать все» закреплены: список
                листается, а действие относится ко всему списку сразу. */}
            <PageHeader
                title="Уведомления"
                meta={
                    unreadCount > 0 ? (
                        <span className={Styles['notifications-page__counter']}>
                            Непрочитанных: {unreadCount}
                        </span>
                    ) : undefined
                }
                actions={
                    unreadCount > 0 ? (
                        <Button
                            variant="text"
                            className={Styles['notifications-page__read-all']}
                            loading={isMarkingAllAsRead}
                            onClick={markAllAsRead}
                        >
                            Прочитать все
                        </Button>
                    ) : undefined
                }
            />

            <div className={Styles['notifications-page']}>
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
                    <div ref={listRef} className={Styles['notifications-page__list']}>
                        {paginatedNotifications.map((notification) => (
                            <NotificationRow
                                key={notification.id}
                                notification={notification}
                                onOpen={openExchange}
                            />
                        ))}
                    </div>
                )}
                {totalPages > 1 && (
                    <div ref={paginationRef} className={Styles['notifications-page__pagination']}>
                        <Pagination
                            currentPage={currentPage}
                            total={totalPages}
                            onChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </MainSection>
    );
};
