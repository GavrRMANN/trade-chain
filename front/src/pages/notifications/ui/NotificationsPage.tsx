import {MainSection} from '@shared/ui/mainSection';
import {Preloader} from '@shared/ui/preloader';
import {PageError} from '@shared/ui/pageError';
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
            <div className={Styles['notifications-page']}>
                <header className={Styles['notifications-page__header']}>
                    {unreadCount > 0 && (
                        <>
                            <span className={Styles['notifications-page__counter']}>
                                Непрочитанных: {unreadCount}
                            </span>
                            <Button
                                variant="text"
                                className={Styles['notifications-page__read-all']}
                                loading={isMarkingAllAsRead}
                                onClick={markAllAsRead}
                            >
                                Прочитать все
                            </Button>
                        </>
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
