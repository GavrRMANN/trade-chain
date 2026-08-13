import type { ReactNode } from 'react';

import Styles from './view-mode-toggle.module.css';

export type TViewModeOption<TValue extends string> = {
    value: TValue;
    /** Подпись режима. Видна на desktop, на mobile скрывается в пользу иконки. */
    label: string;
    icon?: ReactNode;
};

type TViewModeToggleProps<TValue extends string> = {
    options: TViewModeOption<TValue>[];
    value: TValue;
    onChange: (value: TValue) => void;
    /** Название группы для скринридера: без него переключатель безымянный. */
    ariaLabel: string;
    /** Компактный размер — когда переключатель стоит рядом с заголовком. */
    size?: 'md' | 'sm';
};

/**
 * Сегментированный переключатель равноправных режимов отображения.
 *
 * Это именно выбор одного из нескольких, а не флажок «включено/выключено»:
 * поэтому здесь radiogroup, а не {@link ../switcher Switcher} — тот сообщает
 * скринридеру состояние checkbox и не называет второй вариант.
 */
export const ViewModeToggle = <TValue extends string>({
    options,
    value,
    onChange,
    ariaLabel,
    size = 'md',
}: TViewModeToggleProps<TValue>) => (
    <div
        className={[Styles['view-mode-toggle'], Styles[`view-mode-toggle--${size}`]].join(' ')}
        role="radiogroup"
        aria-label={ariaLabel}
    >
        {options.map((option) => {
            const isActive = option.value === value;

            return (
                <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    className={[
                        Styles['view-mode-toggle__option'],
                        isActive && Styles['view-mode-toggle__option--active'],
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    onClick={() => onChange(option.value)}
                >
                    {option.icon && (
                        <span className={Styles['view-mode-toggle__icon']} aria-hidden="true">
                            {option.icon}
                        </span>
                    )}
                    <span className={Styles['view-mode-toggle__label']}>{option.label}</span>
                </button>
            );
        })}
    </div>
);
