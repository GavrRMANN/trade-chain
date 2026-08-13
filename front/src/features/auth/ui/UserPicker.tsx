import type { TCustomerOverview } from '@entities/customer';
import { pluralize } from '@shared/lib';
import { Button } from '@shared/ui/button';
import { ProfileAvatar } from '@shared/ui/profileAvatar';
import { Rating } from '@shared/ui/rating';
import { Spinner } from '@shared/ui/spinner';

import Styles from './user-picker.module.css';
import { useUserPicker } from './useUserPicker';

const REVIEW_FORMS: [string, string, string] = ['отзыв', 'отзыва', 'отзывов'];
const PRODUCT_FORMS: [string, string, string] = ['товар', 'товара', 'товаров'];
const ACTIVE_FORMS: [string, string, string] = ['активный', 'активных', 'активных'];
const CHAIN_FORMS: [string, string, string] = ['обмен', 'обмена', 'обменов'];

/** Имя для карточки: ФИО, а если его не заполнили — часть адреса до собаки. */
const getDisplayName = (participant: TCustomerOverview) =>
    participant.full_name.trim() || participant.email.split('@')[0];

export const UserPicker = () => {
    const {
        participants,
        isLoading,
        isSigningIn,
        pendingCustomerId,
        listError,
        signInError,
        refetch,
        signInAs,
    } = useUserPicker();

    if (isLoading) {
        return (
            <div className={Styles['user-picker__state']}>
                <Spinner aria-label="Загружаем участников" />
                <p className={Styles['user-picker__hint']}>Загружаем участников…</p>
            </div>
        );
    }

    if (listError) {
        return (
            <div className={Styles['user-picker__state']}>
                <p className={Styles['user-picker__error']}>{listError}</p>
                <Button type="button" variant="secondary" onClick={() => refetch()}>
                    Повторить
                </Button>
            </div>
        );
    }

    if (participants.length === 0) {
        return (
            <div className={Styles['user-picker__state']}>
                <p className={Styles['user-picker__hint']}>
                    Пока нет ни одного участника — зарегистрируйтесь по почте и паролю.
                </p>
            </div>
        );
    }

    return (
        <div className={Styles['user-picker']}>
            <p className={Styles['user-picker__hint']}>
                Нажмите на участника, чтобы войти под ним. Пароль не потребуется.
            </p>

            {signInError && <p className={Styles['user-picker__error']}>{signInError}</p>}

            <ul className={Styles['user-picker__list']}>
                {participants.map((participant) => {
                    const name = getDisplayName(participant);
                    const isPending = pendingCustomerId === participant.customer_id;
                    const hasReviews = participant.review_count > 0;

                    return (
                        <li key={participant.customer_id}>
                            <button
                                type="button"
                                className={Styles['user-picker__item']}
                                disabled={isSigningIn}
                                aria-busy={isPending}
                                // Имя кнопки собирается из вложенных span'ов и
                                // получается кашей из почты, рейтинга и счётчиков.
                                // Скринридеру нужно действие, а не карточка целиком.
                                aria-label={`Войти как ${name}`}
                                onClick={() => signInAs(participant.customer_id)}
                            >
                                <ProfileAvatar useIcon alt={name} />

                                <span className={Styles['user-picker__body']}>
                                    <span className={Styles['user-picker__name']}>{name}</span>
                                    <span className={Styles['user-picker__email']}>
                                        {participant.email}
                                    </span>

                                    <span className={Styles['user-picker__rating']}>
                                        {/* Пустые звёзды без единого отзыва читаются как оценка
                                            «ноль», хотя оценки просто нет. */}
                                        {hasReviews && (
                                            <Rating value={participant.rating} tone="rating" />
                                        )}
                                        <span className={Styles['user-picker__rating-value']}>
                                            {hasReviews
                                                ? `${participant.rating.toFixed(1)} · ${pluralize(participant.review_count, REVIEW_FORMS)}`
                                                : 'Без отзывов'}
                                        </span>
                                    </span>

                                    <span className={Styles['user-picker__stats']}>
                                        <span className={Styles['user-picker__stat']}>
                                            {pluralize(participant.product_count, PRODUCT_FORMS)}
                                        </span>
                                        <span className={Styles['user-picker__stat']}>
                                            {pluralize(
                                                participant.active_product_count,
                                                ACTIVE_FORMS,
                                            )}
                                        </span>
                                        <span className={Styles['user-picker__stat']}>
                                            {pluralize(participant.chain_count, CHAIN_FORMS)}
                                        </span>
                                    </span>
                                </span>

                                {isPending && <Spinner size="sm" aria-label="Входим" />}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
