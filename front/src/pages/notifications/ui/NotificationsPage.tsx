import {MainSection} from '@shared/ui/mainSection';
import {Preloader} from '@shared/ui/preloader';
import {PageError} from '@shared/ui/pageError';
import {Button} from '@shared/ui/button';

import Styles from './notifications-page.module.css';
import {NotificationRow} from '@entities/notification';
import {useNotificationsPage} from '../lib';

export const NotificationsPage = () => {
    const {
        notifications,
        unreadCount,
        isLoading,
        isError,
        openExchange,
        openCatalog,
    } = useNotificationsPage();

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
