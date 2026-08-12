import { Button } from '@shared/ui/button';

import Styles from './feed-item.module.css';

type TFeedActionsProps = {
    productTitle: string;
    /** Мобильная лента показывает круглые иконки, desktop — обычные кнопки. */
    variant: 'compact' | 'panel';
    onOfferExchange: () => void;
    onBuildRoute: () => void;
    onOpenProduct: () => void;
    onOpenOwner: () => void;
};

const ICONS = {
    exchange: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5" />
        </svg>
    ),
    route: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 20V8a3 3 0 0 1 3-3h6a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h9" />
        </svg>
    ),
    open: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 5h6M5 5v6M5 5l7 7M19 19h-6M19 19v-6M19 19l-7-7" />
        </svg>
    ),
    owner: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0" />
        </svg>
    ),
};

/**
 * Действия карточки ленты.
 *
 * Все четыре ведут в уже существующие сценарии — своей механики обмена
 * у ленты нет. Действия только явные: свайп листает и ничего не решает
 * за пользователя.
 */
export const FeedActions = ({
    productTitle,
    variant,
    onOfferExchange,
    onBuildRoute,
    onOpenProduct,
    onOpenOwner,
}: TFeedActionsProps) => {
    if (variant === 'panel') {
        return (
            <div className={Styles['feed-item__panel-actions']}>
                <Button onClick={onOfferExchange}>Предложить свою вещь</Button>
                <p className={Styles['feed-item__action-hint']}>
                    Выберите, что отдаёте, — владелец ответит на предложение
                </p>

                {/* Второй сценарий: прямого обмена может не быть, и тогда до
                    вещи ведёт цепочка. Название совпадает с карточкой товара,
                    чтобы это читалось как одно и то же действие. */}
                <Button variant="secondary" onClick={onBuildRoute}>
                    Построить цепочку обменов
                </Button>

                <div className={Styles['feed-item__panel-secondary']}>
                    <Button variant="text" onClick={onOpenProduct}>
                        Подробнее о вещи
                    </Button>
                    <Button variant="text" onClick={onOpenOwner}>
                        Отзывы владельца
                    </Button>
                </div>
            </div>
        );
    }

    /* Подпись под иконкой — глагол или предмет действия, а не обрубок
       названия: «Путь» и «Открыть» одинаково подходили к любому из
       четырёх действий и ничего не объясняли. Полную формулировку
       получает aria-label. */
    const actions = [
        {
            key: 'exchange',
            label: 'Обменять',
            ariaLabel: `Предложить свою вещь в обмен на «${productTitle}»`,
            icon: ICONS.exchange,
            onClick: onOfferExchange,
            isPrimary: true,
        },
        {
            key: 'route',
            label: 'Цепочка',
            ariaLabel: `Построить цепочку обменов до «${productTitle}»`,
            icon: ICONS.route,
            onClick: onBuildRoute,
            isPrimary: false,
        },
        {
            key: 'open',
            label: 'Подробнее',
            ariaLabel: `Открыть объявление «${productTitle}»`,
            icon: ICONS.open,
            onClick: onOpenProduct,
            isPrimary: false,
        },
        {
            key: 'owner',
            label: 'Владелец',
            ariaLabel: `Открыть профиль и отзывы владельца «${productTitle}»`,
            icon: ICONS.owner,
            onClick: onOpenOwner,
            isPrimary: false,
        },
    ];

    return (
        <div className={Styles['feed-item__actions']}>
            {actions.map((action) => (
                <button
                    key={action.key}
                    type="button"
                    className={[
                        Styles['feed-item__action'],
                        action.isPrimary && Styles['feed-item__action--primary'],
                    ]
                        .filter(Boolean)
                        .join(' ')}
                    aria-label={action.ariaLabel}
                    onClick={action.onClick}
                >
                    <span className={Styles['feed-item__action-icon']}>{action.icon}</span>
                    <span className={Styles['feed-item__action-label']}>{action.label}</span>
                </button>
            ))}
        </div>
    );
};
