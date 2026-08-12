import { MainSection } from '@shared/ui/mainSection';
import { PageHeader } from '@shared/ui/pageHeader';
import { Preloader } from '@shared/ui/preloader';
import { ProfileAvatar } from '@shared/ui/profileAvatar';
import { Spinner } from '@shared/ui/spinner';

import { useDemoAccounts } from '../lib';
import Styles from './demo-accounts-page.module.css';

/**
 * Витрина демонстрационных профилей.
 *
 * Первый экран показа — не форма почты и пароля: жюри должно за один клик
 * попасть в аккаунт с подготовленным состоянием и заранее видеть, какой
 * сценарий этот аккаунт показывает.
 */
export const DemoAccountsPage = () => {
    const { profiles, isLoading, pendingCustomerId, signInError, signInAs } = useDemoAccounts();

    return (
        <MainSection>
            <PageHeader
                title="Выберите демо-аккаунт"
                subTitle="Каждый профиль подготовлен под свой сценарий обмена. Пароль не потребуется."
            />

            {signInError && <p className={Styles['demo-accounts__error']}>{signInError}</p>}

            {isLoading ? (
                <Preloader message="Загружаем профили…" />
            ) : (
                <ul className={Styles['demo-accounts']}>
                    {profiles.map((profile) => (
                        <li key={profile.customerId}>
                            <button
                                type="button"
                                className={Styles['demo-accounts__card']}
                                disabled={Boolean(pendingCustomerId)}
                                aria-busy={pendingCustomerId === profile.customerId}
                                aria-label={`Войти как «${profile.role}»`}
                                onClick={() => signInAs(profile.customerId)}
                            >
                                <span className={Styles['demo-accounts__head']}>
                                    <ProfileAvatar useIcon alt={profile.role} />
                                    <span className={Styles['demo-accounts__role']}>
                                        {profile.role}
                                    </span>
                                    {pendingCustomerId === profile.customerId && (
                                        <Spinner size="sm" aria-label="Входим" />
                                    )}
                                </span>

                                <span className={Styles['demo-accounts__state']}>
                                    {profile.state}
                                </span>
                                <span className={Styles['demo-accounts__scenario']}>
                                    {profile.scenario}
                                </span>

                                {profile.overview && (
                                    <span className={Styles['demo-accounts__stats']}>
                                        {profile.overview.active_product_count} активных ·{' '}
                                        {profile.overview.chain_count} обменов
                                        {profile.overview.review_count > 0 &&
                                            ` · рейтинг ${profile.overview.rating.toFixed(1)}`}
                                    </span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </MainSection>
    );
};
