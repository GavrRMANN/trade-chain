package service

import (
	"context"
	"errors"
	"testing"
	"time"

	"trade-chain/internal/domain"
	"trade-chain/internal/exchange"
)

func newOfferFixture(status domain.ChainStatus) (*fixture, OfferService) {
	f := newFixture(status)
	return f, NewOfferService(f.service, f.chains, f.negotiations)
}

func TestOfferListSeparatesIncomingFromOutgoing(t *testing.T) {
	_, offers := newOfferFixture(domain.ChainPending)
	ctx := context.Background()

	cases := []struct {
		name  string
		actor string
		role  domain.OfferRole
		want  int
	}{
		{"инициатор смотрит исходящие", initiator, domain.RoleOutgoing, 1},
		{"инициатор смотрит входящие", initiator, domain.RoleIncoming, 0},
		{"получатель смотрит входящие", recipient, domain.RoleIncoming, 1},
		{"получатель смотрит исходящие", recipient, domain.RoleOutgoing, 0},
		{"посторонний не видит ничего", stranger, domain.RoleAny, 0},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			found, err := offers.List(ctx, tc.actor, tc.role, nil)
			if err != nil {
				t.Fatalf("неожиданная ошибка: %v", err)
			}
			if len(found) != tc.want {
				t.Fatalf("предложений %d, ожидалось %d", len(found), tc.want)
			}
			if tc.want > 0 && found[0].Status != exchange.OfferPending {
				t.Errorf("статус %q, ожидался pending", found[0].Status)
			}
		})
	}
}

// Просроченное предложение лежит в базе всё ещё как pending, поэтому отбор
// по статусу нельзя оставлять одной базе.
func TestExpiredOfferLeavesPendingList(t *testing.T) {
	f, offers := newOfferFixture(domain.ChainPending)
	ctx := context.Background()

	chain := f.chains.chains[chainID]
	chain.ExpiresAt = time.Now().Add(-time.Hour)
	f.chains.chains[chainID] = chain

	pending, err := offers.List(ctx, initiator, domain.RoleAny, []exchange.OfferStatus{exchange.OfferPending})
	if err != nil {
		t.Fatalf("неожиданная ошибка: %v", err)
	}
	if len(pending) != 0 {
		t.Errorf("просроченное предложение попало в список ожидающих ответа")
	}

	expired, err := offers.List(ctx, initiator, domain.RoleAny, []exchange.OfferStatus{exchange.OfferExpired})
	if err != nil {
		t.Fatalf("неожиданная ошибка: %v", err)
	}
	if len(expired) != 1 {
		t.Fatalf("просроченных предложений %d, ожидалось 1", len(expired))
	}
}

func TestAcceptedOfferShowsExchangeAwaitingSides(t *testing.T) {
	_, offers := newOfferFixture(domain.ChainPending)
	ctx := context.Background()

	offer, err := offers.Accept(ctx, chainID, recipient)
	if err != nil {
		t.Fatalf("получатель должен уметь принять предложение: %v", err)
	}
	if offer.Status != exchange.OfferAccepted {
		t.Errorf("статус предложения %q, ожидался accepted", offer.Status)
	}
	if offer.Exchange != exchange.ExchangeAwaitingInitiator {
		t.Errorf("статус обмена %q, ожидался awaiting_initiator", offer.Exchange)
	}

	offer, err = offers.Confirm(ctx, chainID, initiator, true, "")
	if err != nil {
		t.Fatalf("неожиданная ошибка: %v", err)
	}
	if offer.Exchange != exchange.ExchangeAwaitingRecipient {
		t.Errorf("статус обмена %q, ожидался awaiting_recipient", offer.Exchange)
	}
}

func TestFailedConfirmationKeepsReason(t *testing.T) {
	f, offers := newOfferFixture(domain.ChainActive)
	ctx := context.Background()

	if _, err := offers.Confirm(ctx, chainID, initiator, false, "  не договорились о встрече  "); err != nil {
		t.Fatalf("неожиданная ошибка: %v", err)
	}

	stored := f.negotiations.confirmations[0]
	if stored.Reason != "не договорились о встрече" {
		t.Errorf("причина %q, ожидалась без обрамляющих пробелов", stored.Reason)
	}
}

func TestSuccessfulConfirmationDropsReason(t *testing.T) {
	f, offers := newOfferFixture(domain.ChainActive)
	ctx := context.Background()

	if _, err := offers.Confirm(ctx, chainID, initiator, true, "всё прошло хорошо"); err != nil {
		t.Fatalf("неожиданная ошибка: %v", err)
	}

	if got := f.negotiations.confirmations[0].Reason; got != "" {
		t.Errorf("причина %q, у состоявшегося обмена её быть не должно", got)
	}
}

func TestOfferDetailsHiddenFromStranger(t *testing.T) {
	_, offers := newOfferFixture(domain.ChainActive)
	ctx := context.Background()

	if _, err := offers.Details(ctx, chainID, stranger); !errors.Is(err, ErrForbidden) {
		t.Fatalf("ошибка %v, ожидалась ErrForbidden", err)
	}

	details, err := offers.Details(ctx, chainID, recipient)
	if err != nil {
		t.Fatalf("участник должен видеть карточку: %v", err)
	}
	if details.Exchange != exchange.ExchangeAwaitingInitiator {
		t.Errorf("статус обмена %q, ожидался awaiting_initiator", details.Exchange)
	}
}

func TestSecondOfferForSamePairIsRejected(t *testing.T) {
	f, offers := newOfferFixture(domain.ChainPending)
	ctx := context.Background()

	// Уникальный индекс живёт в базе, поэтому фейк повторяет его правило.
	f.chains.rejectDuplicates = true

	_, err := offers.Create(ctx, CreateOfferInput{
		InitiatorID:        initiator,
		OfferedProductID:   offeredID,
		RequestedProductID: requestedID,
	})
	if !errors.Is(err, ErrConflict) {
		t.Fatalf("ошибка %v, ожидалась ErrConflict", err)
	}
}
