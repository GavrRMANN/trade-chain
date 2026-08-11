type TUseRouteGroupCardProps = {
    openOffersCount: number;
    offersCount: number;
    updatedAt: string;
    formatActiveOffers: (count: number) => string;
    formatDate: (value: string) => string;
};

/** Готовит короткие подписи маршрутной карточки без смешения с JSX. */
export const useRouteGroupCard = ({
    openOffersCount,
    offersCount,
    updatedAt,
    formatActiveOffers,
    formatDate,
}: TUseRouteGroupCardProps) => ({
    offersLabel:
        openOffersCount > 0 ? formatActiveOffers(openOffersCount) : 'Нет активных предложений',
    detailsLabel: `Всего обменов: ${offersCount} · Обновлено ${formatDate(updatedAt)}`,
});
