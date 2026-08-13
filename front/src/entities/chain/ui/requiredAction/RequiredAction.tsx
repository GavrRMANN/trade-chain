import type { TRequiredAction } from '../../lib';

import Styles from './required-action.module.css';

type TRequiredActionProps = {
    action: TRequiredAction;
    className?: string;
};

/**
 * Блок «От вас требуется».
 *
 * Технический статус заставляет пользователя угадывать следующий шаг,
 * поэтому рядом со статусом всегда показывается действие. Когда ход за
 * второй стороной, блок выглядит спокойно — торопить тут нечем.
 */
export const RequiredAction = ({ action, className }: TRequiredActionProps) => (
    <p
        className={[
            Styles['required-action'],
            Styles[`required-action--${action.actor}`],
            className,
        ]
            .filter(Boolean)
            .join(' ')}
    >
        <span className={Styles['required-action__label']}>
            {action.actor === 'you' ? 'От вас требуется' : 'Сейчас ждём'}
        </span>
        <span className={Styles['required-action__text']}>{action.text}</span>
    </p>
);
