package exchange

import (
	"strings"
	"time"

	"trade-chain/internal/domain"
)

// Предложение и обмен — это два взгляда на одно звено, а не две записи.
//
// Пока вторая сторона не ответила, звено читается как предложение: его можно
// принять, отклонить или отозвать. После согласия то же звено читается как
// обмен, у которого свой вопрос — состоялась встреча или нет. Разводить их
// по таблицам незачем: жизнь у них общая, и раздвоение создало бы состояние,
// в котором предложение принято, а обмена ещё нет.

// OfferStatus — состояние предложения в терминах API.
type OfferStatus string

const (
	OfferPending   OfferStatus = "pending"
	OfferAccepted  OfferStatus = "accepted"
	OfferDeclined  OfferStatus = "declined"
	OfferCancelled OfferStatus = "cancelled"
	OfferExpired   OfferStatus = "expired"
	OfferCompleted OfferStatus = "completed"
	// OfferFailed выходит за список статусов из API.md намеренно: обмен по
	// принятому предложению может не состояться, и прятать это под completed
	// значит показать человеку успешную сделку там, где её не было.
	OfferFailed OfferStatus = "failed"
)

// ExchangeStatus — состояние подтверждённого обмена.
type ExchangeStatus string

const (
	ExchangeAwaitingInitiator ExchangeStatus = "awaiting_initiator"
	ExchangeAwaitingRecipient ExchangeStatus = "awaiting_recipient"
	ExchangeCompleted         ExchangeStatus = "completed"
	ExchangeFailed            ExchangeStatus = "failed"
)

// offerStatuses переводит состояние звена в состояние предложения.
//
// countered читается как declined: встречное предложение — это отдельное
// звено, а исходное на него уже не ждёт ответа.
var offerStatuses = map[domain.ChainStatus]OfferStatus{
	domain.ChainPending:   OfferPending,
	domain.ChainActive:    OfferAccepted,
	domain.ChainRejected:  OfferDeclined,
	domain.ChainCountered: OfferDeclined,
	domain.ChainCancelled: OfferCancelled,
	domain.ChainExpired:   OfferExpired,
	domain.ChainCompleted: OfferCompleted,
	domain.ChainFailed:    OfferFailed,
}

// OfferStatusOf сообщает, в каком состоянии предложение прямо сейчас.
//
// Истёкший срок учитывается на чтении: фонового процесса, который проставлял
// бы expired, в приложении нет, а показывать предложение живым, когда отвечать
// на него уже поздно, — обманывать обе стороны.
func OfferStatusOf(deal Deal, now time.Time) OfferStatus {
	if deal.Status == domain.ChainPending && IsExpired(deal, now) {
		return OfferExpired
	}
	if status, ok := offerStatuses[deal.Status]; ok {
		return status
	}
	return OfferPending
}

// ExchangeStatusOf собирает состояние обмена из подтверждений сторон.
//
// Второе возвращаемое значение сообщает, есть ли обмен вообще: пока
// предложение не принято, подтверждать нечего.
func ExchangeStatusOf(deal Deal, confirmations []domain.ChainConfirmation) (ExchangeStatus, bool) {
	switch deal.Status {
	case domain.ChainCompleted:
		return ExchangeCompleted, true
	case domain.ChainFailed:
		return ExchangeFailed, true
	case domain.ChainActive:
	default:
		return "", false
	}

	// Отказ перевешивает согласие второй стороны, поэтому весь список
	// просматривается целиком: выйти на первом же «да» значило бы показать
	// ожидание там, где обмен уже сорвался.
	confirmed := make(map[string]bool, 2)
	for _, confirmation := range confirmations {
		if !deal.Involves(confirmation.CustomerID) {
			continue
		}
		if !confirmation.Success {
			return ExchangeFailed, true
		}
		confirmed[confirmation.CustomerID] = true
	}

	// Первым ход инициатора: он предложил обмен, ему и подтверждать встречу.
	// Но если получатель успел раньше, ждут всё равно вторую сторону, а не
	// порядок из документации.
	if confirmed[deal.InitiatorID] && !confirmed[deal.RecipientID] {
		return ExchangeAwaitingRecipient, true
	}
	return ExchangeAwaitingInitiator, true
}

// ValidateSurcharge проверяет договорённость о доплате.
//
// Доплата без плательщика — сумма, которую никто не должен; плательщик без
// суммы — обязательство размером в ноль. И то и другое стороны прочитают
// по-своему, поэтому не принимается ни то, ни другое.
func ValidateSurcharge(deal Deal, surcharge domain.Surcharge) error {
	if surcharge.Amount < 0 {
		return domain.ErrInvalidSurcharge
	}

	if surcharge.Amount == 0 {
		if surcharge.Payer != nil {
			return domain.ErrInvalidSurcharge
		}
		return nil
	}

	if surcharge.Payer == nil || !deal.Involves(*surcharge.Payer) {
		return domain.ErrInvalidSurcharge
	}
	if len(strings.TrimSpace(surcharge.Currency)) != 3 {
		return domain.ErrInvalidSurcharge
	}

	return nil
}

// NormalizeSurcharge приводит доплату к виду, пригодному для хранения.
func NormalizeSurcharge(surcharge domain.Surcharge) domain.Surcharge {
	surcharge.Currency = strings.ToUpper(strings.TrimSpace(surcharge.Currency))
	if surcharge.Currency == "" {
		surcharge.Currency = domain.DefaultCurrency
	}
	return surcharge
}
