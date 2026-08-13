import { useState } from 'react';

import Styles from './auth-form.module.css';
import { PasswordForm } from './PasswordForm';
import { UserPicker } from './UserPicker';

type TAuthMethod = 'password' | 'participant';

const METHODS: {value: TAuthMethod; label: string}[] = [
    {value: 'password', label: 'Почта и пароль'},
    {value: 'participant', label: 'Выбрать участника'},
];

/**
 * Вход двумя способами.
 *
 * Обычный — почта и пароль. Второй, выбор участника из списка, нужен, чтобы
 * увидеть обмен: для него требуются две стороны с товарами, желаниями и
 * историей, а свежезарегистрированный аккаунт пуст и не показывает ни
 * каталога, ни цепочки.
 */
export const AuthForm = () => {
    const [method, setMethod] = useState<TAuthMethod>('password');

    return (
        <div className={Styles.auth}>
            <div className={Styles.methods} role="tablist" aria-label="Способ входа">
                {METHODS.map(({value, label}) => (
                    <button
                        key={value}
                        type="button"
                        role="tab"
                        id={`auth-method-${value}`}
                        aria-selected={method === value}
                        aria-controls={`auth-panel-${value}`}
                        className={[Styles.method, method === value && Styles['method--active']]
                            .filter(Boolean)
                            .join(' ')}
                        onClick={() => setMethod(value)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div
                className={Styles.panel}
                role="tabpanel"
                id={`auth-panel-${method}`}
                aria-labelledby={`auth-method-${method}`}
            >
                {method === 'password' ? <PasswordForm /> : <UserPicker />}
            </div>
        </div>
    );
};
