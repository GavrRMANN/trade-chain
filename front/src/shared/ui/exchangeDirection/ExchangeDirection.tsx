import Styles from './ExchangeDirection.module.css';

type TExchangeDirectionProps = {
    className?: string;
};

export const ExchangeDirection = ({ className }: TExchangeDirectionProps) => (
    <span
        className={[Styles['exchange-direction'], className].filter(Boolean).join(' ')}
        aria-hidden="true"
    >
        <svg viewBox="0 0 24 24" focusable="false">
            <path d="M7 7h9l-2.5-2.5" />
            <path d="M17 17H8l2.5 2.5" />
        </svg>
    </span>
);
