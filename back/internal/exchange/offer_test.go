package exchange_test

import (
	"errors"
	"testing"

	"trade-chain/internal/domain"
	"trade-chain/internal/exchange"
)

func acceptedDeal() exchange.Deal {
	deal := pendingDeal()
	deal.Status = domain.ChainActive
	return deal
}

func confirmation(customerID string, success bool) domain.ChainConfirmation {
	return domain.ChainConfirmation{CustomerID: customerID, Success: success}
}

func TestOfferStatusFollowsChain(t *testing.T) {
	cases := []struct {
		chain domain.ChainStatus
		want  exchange.OfferStatus
	}{
		{domain.ChainPending, exchange.OfferPending},
		{domain.ChainActive, exchange.OfferAccepted},
		{domain.ChainRejected, exchange.OfferDeclined},
		{domain.ChainCountered, exchange.OfferDeclined},
		{domain.ChainCancelled, exchange.OfferCancelled},
		{domain.ChainExpired, exchange.OfferExpired},
		{domain.ChainCompleted, exchange.OfferCompleted},
		{domain.ChainFailed, exchange.OfferFailed},
	}

	for _, tc := range cases {
		t.Run(string(tc.chain), func(t *testing.T) {
			deal := pendingDeal()
			deal.Status = tc.chain

			if got := exchange.OfferStatusOf(deal, now); got != tc.want {
				t.Errorf("статус %q, ожидался %q", got, tc.want)
			}
		})
	}
}

func TestExpiredOfferReadsAsExpired(t *testing.T) {
	deal := pendingDeal()
	deal.ExpiresAt = now.Add(-1)

	if got := exchange.OfferStatusOf(deal, now); got != exchange.OfferExpired {
		t.Errorf("статус %q, ожидался expired", got)
	}
}

func TestExchangeAppearsOnlyAfterAccept(t *testing.T) {
	if _, ok := exchange.ExchangeStatusOf(pendingDeal(), nil); ok {
		t.Error("у непринятого предложения не должно быть обмена")
	}

	status, ok := exchange.ExchangeStatusOf(acceptedDeal(), nil)
	if !ok {
		t.Fatal("принятое предложение должно давать обмен")
	}
	if status != exchange.ExchangeAwaitingInitiator {
		t.Errorf("статус %q, ожидался awaiting_initiator", status)
	}
}

func TestExchangeWaitsForSecondSide(t *testing.T) {
	cases := []struct {
		name  string
		first string
		want  exchange.ExchangeStatus
	}{
		{"подтвердил инициатор", initiator, exchange.ExchangeAwaitingRecipient},
		{"подтвердил получатель", recipient, exchange.ExchangeAwaitingInitiator},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got, _ := exchange.ExchangeStatusOf(acceptedDeal(), []domain.ChainConfirmation{
				confirmation(tc.first, true),
			})
			if got != tc.want {
				t.Errorf("статус %q, ожидался %q", got, tc.want)
			}
		})
	}
}

func TestOneRefusalFailsExchange(t *testing.T) {
	got, _ := exchange.ExchangeStatusOf(acceptedDeal(), []domain.ChainConfirmation{
		confirmation(initiator, true),
		confirmation(recipient, false),
	})
	if got != exchange.ExchangeFailed {
		t.Errorf("статус %q, ожидался failed", got)
	}
}

func TestStrangerConfirmationIsIgnored(t *testing.T) {
	got, _ := exchange.ExchangeStatusOf(acceptedDeal(), []domain.ChainConfirmation{
		confirmation(stranger, false),
	})
	if got != exchange.ExchangeAwaitingInitiator {
		t.Errorf("статус %q, ожидался awaiting_initiator", got)
	}
}

func TestSurchargeNeedsPayerFromTheDeal(t *testing.T) {
	deal := pendingDeal()

	cases := []struct {
		name      string
		surcharge domain.Surcharge
		valid     bool
	}{
		{"без доплаты", domain.Surcharge{Currency: "RUB"}, true},
		{"доплачивает инициатор", domain.Surcharge{Amount: 5000, Currency: "RUB", Payer: &deal.InitiatorID}, true},
		{"доплачивает получатель", domain.Surcharge{Amount: 5000, Currency: "RUB", Payer: &deal.RecipientID}, true},
		{"сумма без плательщика", domain.Surcharge{Amount: 5000, Currency: "RUB"}, false},
		{"плательщик без суммы", domain.Surcharge{Currency: "RUB", Payer: &deal.InitiatorID}, false},
		{"отрицательная сумма", domain.Surcharge{Amount: -1, Currency: "RUB", Payer: &deal.InitiatorID}, false},
		{"платит посторонний", domain.Surcharge{Amount: 5000, Currency: "RUB", Payer: ptr(stranger)}, false},
		{"валюта не из трёх букв", domain.Surcharge{Amount: 5000, Currency: "RU", Payer: &deal.InitiatorID}, false},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			err := exchange.ValidateSurcharge(deal, tc.surcharge)
			if tc.valid && err != nil {
				t.Fatalf("неожиданная ошибка: %v", err)
			}
			if !tc.valid && !errors.Is(err, domain.ErrInvalidSurcharge) {
				t.Fatalf("ошибка %v, ожидалась ErrInvalidSurcharge", err)
			}
		})
	}
}

func TestSurchargeGetsDefaultCurrency(t *testing.T) {
	got := exchange.NormalizeSurcharge(domain.Surcharge{Amount: 100, Currency: " rub "})
	if got.Currency != "RUB" {
		t.Errorf("валюта %q, ожидалась RUB", got.Currency)
	}

	if got := exchange.NormalizeSurcharge(domain.Surcharge{}); got.Currency != domain.DefaultCurrency {
		t.Errorf("валюта %q, ожидалась %q", got.Currency, domain.DefaultCurrency)
	}
}

func ptr(v string) *string { return &v }
