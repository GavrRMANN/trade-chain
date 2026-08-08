package exchange_test

import (
	"errors"
	"testing"
	"time"

	"trade-chain/internal/domain"
	"trade-chain/internal/exchange"
)

const (
	initiator = "11111111-1111-1111-1111-111111111111" // предложил обмен
	recipient = "22222222-2222-2222-2222-222222222222" // владелец запрошенного товара
	stranger  = "33333333-3333-3333-3333-333333333333" // к сделке отношения не имеет
)

var now = time.Date(2026, 8, 8, 12, 0, 0, 0, time.UTC)

func pendingDeal() exchange.Deal {
	return exchange.Deal{
		ChainID:     "44444444-4444-4444-4444-444444444444",
		InitiatorID: initiator,
		RecipientID: recipient,
		Status:      domain.ChainPending,
		ExpiresAt:   now.Add(exchange.DefaultTTL),
	}
}

func TestRecipientDecidesFateOfOffer(t *testing.T) {
	cases := []struct {
		name   string
		action exchange.Action
		want   domain.ChainStatus
	}{
		{"принимает", exchange.ActionAccept, domain.ChainActive},
		{"отклоняет", exchange.ActionDecline, domain.ChainRejected},
		{"предлагает встречный вариант", exchange.ActionCounter, domain.ChainCountered},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got, err := exchange.Apply(pendingDeal(), tc.action, recipient, now)
			if err != nil {
				t.Fatalf("неожиданная ошибка: %v", err)
			}
			if got != tc.want {
				t.Errorf("статус %q, ожидался %q", got, tc.want)
			}
		})
	}
}

func TestInitiatorCannotAcceptOwnOffer(t *testing.T) {
	_, err := exchange.Apply(pendingDeal(), exchange.ActionAccept, initiator, now)
	if !errors.Is(err, domain.ErrWrongActor) {
		t.Fatalf("ошибка %v, ожидалась ErrWrongActor", err)
	}
}

func TestInitiatorCanCancelButRecipientCannot(t *testing.T) {
	if _, err := exchange.Apply(pendingDeal(), exchange.ActionCancel, initiator, now); err != nil {
		t.Fatalf("инициатор должен уметь отозвать предложение: %v", err)
	}
	if _, err := exchange.Apply(pendingDeal(), exchange.ActionCancel, recipient, now); !errors.Is(err, domain.ErrWrongActor) {
		t.Fatalf("ошибка %v, ожидалась ErrWrongActor", err)
	}
}

func TestStrangerCannotTouchOffer(t *testing.T) {
	_, err := exchange.Apply(pendingDeal(), exchange.ActionAccept, stranger, now)
	if !errors.Is(err, domain.ErrNotParticipant) {
		t.Fatalf("ошибка %v, ожидалась ErrNotParticipant", err)
	}
}

func TestFinalDealCannotChange(t *testing.T) {
	deal := pendingDeal()
	deal.Status = domain.ChainRejected

	if _, err := exchange.Apply(deal, exchange.ActionAccept, recipient, now); !errors.Is(err, domain.ErrChainFinal) {
		t.Fatalf("ошибка %v, ожидалась ErrChainFinal", err)
	}
}

func TestAcceptedDealCannotBeAcceptedTwice(t *testing.T) {
	deal := pendingDeal()
	deal.Status = domain.ChainActive

	if _, err := exchange.Apply(deal, exchange.ActionAccept, recipient, now); !errors.Is(err, domain.ErrInvalidTransition) {
		t.Fatalf("ошибка %v, ожидалась ErrInvalidTransition", err)
	}
}

func TestExpiredDealRejectsDecisions(t *testing.T) {
	deal := pendingDeal()
	late := deal.ExpiresAt.Add(time.Minute)

	if _, err := exchange.Apply(deal, exchange.ActionAccept, recipient, late); !errors.Is(err, domain.ErrChainFinal) {
		t.Fatalf("ошибка %v, ожидалась ErrChainFinal", err)
	}

	status, err := exchange.Apply(deal, exchange.ActionExpire, "", late)
	if err != nil {
		t.Fatalf("система должна уметь пометить предложение истёкшим: %v", err)
	}
	if status != domain.ChainExpired {
		t.Errorf("статус %q, ожидался %q", status, domain.ChainExpired)
	}
}

// Бессрочное звено не должно считаться истёкшим: нулевое время — это
// «срок не задан», а не «срок в прошлом».
func TestDealWithoutDeadlineNeverExpires(t *testing.T) {
	deal := pendingDeal()
	deal.ExpiresAt = time.Time{}

	if exchange.IsExpired(deal, now.AddDate(1, 0, 0)) {
		t.Error("звено без срока не должно истекать")
	}
}

func TestResolveNeedsBothSidesForSuccess(t *testing.T) {
	deal := pendingDeal()
	deal.Status = domain.ChainActive

	onlyOne := []domain.ChainConfirmation{{CustomerID: initiator, Success: true}}
	status, settled := exchange.Resolve(deal, onlyOne)
	if settled {
		t.Fatal("одного подтверждения недостаточно для завершения обмена")
	}
	if status != domain.ChainActive {
		t.Errorf("статус %q, ожидался %q", status, domain.ChainActive)
	}

	both := append(onlyOne, domain.ChainConfirmation{CustomerID: recipient, Success: true})
	status, settled = exchange.Resolve(deal, both)
	if !settled || status != domain.ChainCompleted {
		t.Errorf("статус %q (settled=%v), ожидался %q", status, settled, domain.ChainCompleted)
	}
}

func TestResolveFailsOnSingleNegativeConfirmation(t *testing.T) {
	deal := pendingDeal()
	deal.Status = domain.ChainActive

	confirmations := []domain.ChainConfirmation{
		{CustomerID: initiator, Success: true},
		{CustomerID: recipient, Success: false},
	}

	status, settled := exchange.Resolve(deal, confirmations)
	if !settled || status != domain.ChainFailed {
		t.Errorf("статус %q (settled=%v), ожидался %q — «не договорились» решает одна сторона",
			status, settled, domain.ChainFailed)
	}
}

func TestResolveIgnoresConfirmationsFromOutsiders(t *testing.T) {
	deal := pendingDeal()
	deal.Status = domain.ChainActive

	confirmations := []domain.ChainConfirmation{
		{CustomerID: initiator, Success: true},
		{CustomerID: stranger, Success: false},
	}

	if status, settled := exchange.Resolve(deal, confirmations); settled {
		t.Fatalf("посторонний не может решать исход сделки, получен статус %q", status)
	}
}

func TestCanConfirmRejectsSecondConfirmationFromSameUser(t *testing.T) {
	deal := pendingDeal()
	deal.Status = domain.ChainActive
	existing := []domain.ChainConfirmation{{CustomerID: initiator, Success: true}}

	if err := exchange.CanConfirm(deal, initiator, existing); !errors.Is(err, domain.ErrAlreadyConfirmed) {
		t.Fatalf("ошибка %v, ожидалась ErrAlreadyConfirmed", err)
	}
	if err := exchange.CanConfirm(deal, recipient, existing); err != nil {
		t.Fatalf("вторая сторона ещё не подтверждала: %v", err)
	}
}

func TestCanConfirmRequiresAgreedDeal(t *testing.T) {
	deal := pendingDeal() // ещё никто не согласился

	if err := exchange.CanConfirm(deal, initiator, nil); !errors.Is(err, domain.ErrInvalidTransition) {
		t.Fatalf("ошибка %v, ожидалась ErrInvalidTransition", err)
	}
}

// Отзыв только после состоявшегося обмена — это защита от мести за отказ.
func TestReviewsRequireCompletedExchange(t *testing.T) {
	cases := []struct {
		status  domain.ChainStatus
		allowed bool
	}{
		{domain.ChainCompleted, true},
		{domain.ChainFailed, false},
		{domain.ChainRejected, false},
		{domain.ChainActive, false},
		{domain.ChainCancelled, false},
	}

	for _, tc := range cases {
		t.Run(string(tc.status), func(t *testing.T) {
			deal := pendingDeal()
			deal.Status = tc.status

			err := exchange.CanReview(deal, initiator)
			if tc.allowed && err != nil {
				t.Errorf("отзыв должен быть разрешён, получено %v", err)
			}
			if !tc.allowed && err == nil {
				t.Error("отзыв не должен быть разрешён")
			}
		})
	}
}

func TestChatClosesWithTheDeal(t *testing.T) {
	deal := pendingDeal()
	deal.Status = domain.ChainActive

	if err := exchange.CanWrite(deal, recipient); err != nil {
		t.Fatalf("по активной сделке писать можно: %v", err)
	}
	if err := exchange.CanWrite(deal, stranger); !errors.Is(err, domain.ErrNotParticipant) {
		t.Fatalf("ошибка %v, ожидалась ErrNotParticipant", err)
	}

	deal.Status = domain.ChainCompleted
	if err := exchange.CanWrite(deal, recipient); !errors.Is(err, domain.ErrChainFinal) {
		t.Fatalf("ошибка %v, ожидалась ErrChainFinal", err)
	}
}

func TestValidateRejectsUnavailableProducts(t *testing.T) {
	offered := domain.Product{ProductID: "a", CustomerID: initiator, Status: domain.ProductActive}
	requested := domain.Product{ProductID: "b", CustomerID: recipient, Status: domain.ProductExchanged}

	if err := exchange.Validate(pendingDeal(), offered, requested); !errors.Is(err, domain.ErrProductUnavailable) {
		t.Fatalf("ошибка %v, ожидалась ErrProductUnavailable", err)
	}
}

func TestValidateRejectsSelfExchange(t *testing.T) {
	deal := pendingDeal()
	deal.RecipientID = initiator

	offered := domain.Product{ProductID: "a", CustomerID: initiator, Status: domain.ProductActive}
	requested := domain.Product{ProductID: "b", CustomerID: initiator, Status: domain.ProductActive}

	if err := exchange.Validate(deal, offered, requested); !errors.Is(err, domain.ErrSelfExchange) {
		t.Fatalf("ошибка %v, ожидалась ErrSelfExchange", err)
	}
}

func TestValidateRejectsOfferingSomeoneElsesProduct(t *testing.T) {
	offered := domain.Product{ProductID: "a", CustomerID: stranger, Status: domain.ProductActive}
	requested := domain.Product{ProductID: "b", CustomerID: recipient, Status: domain.ProductActive}

	if err := exchange.Validate(pendingDeal(), offered, requested); !errors.Is(err, domain.ErrNotParticipant) {
		t.Fatalf("ошибка %v, ожидалась ErrNotParticipant", err)
	}
}
