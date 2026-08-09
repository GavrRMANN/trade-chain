package httpapi

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"trade-chain/internal/auth"
	"trade-chain/internal/domain"
	"trade-chain/internal/exchange"
	"trade-chain/internal/service"
)

const testUserID = "11111111-1111-1111-1111-111111111111"

// stubOfferService запоминает, с чем к нему пришли: транспорт проверяется на
// том, что он разобрал запрос и не подставил чужой идентификатор.
type stubOfferService struct {
	createdBy string
	role      domain.OfferRole
	statuses  []exchange.OfferStatus
	success   bool
	reason    string
}

func (s *stubOfferService) offer() *service.Offer {
	return &service.Offer{
		Chain: domain.Chain{
			ChainID:       "44444444-4444-4444-4444-444444444444",
			FromProductID: "prod-1",
			ToProductID:   "prod-2",
			InitiatorID:   testUserID,
			ExpiresAt:     time.Date(2026, 8, 10, 12, 0, 0, 0, time.UTC),
		},
		Status:   exchange.OfferPending,
		Exchange: exchange.ExchangeAwaitingInitiator,
	}
}

func (s *stubOfferService) Create(_ context.Context, in service.CreateOfferInput) (*service.Offer, error) {
	s.createdBy = in.InitiatorID
	return s.offer(), nil
}

func (s *stubOfferService) List(_ context.Context, _ string, role domain.OfferRole, statuses []exchange.OfferStatus) ([]service.Offer, error) {
	s.role = role
	s.statuses = statuses
	return []service.Offer{*s.offer()}, nil
}

func (s *stubOfferService) Details(context.Context, string, string) (*service.OfferDetails, error) {
	return &service.OfferDetails{Offer: *s.offer()}, nil
}

func (s *stubOfferService) Accept(context.Context, string, string) (*service.Offer, error) {
	return s.offer(), nil
}

func (s *stubOfferService) Decline(context.Context, string, string) (*service.Offer, error) {
	return s.offer(), nil
}

func (s *stubOfferService) Cancel(context.Context, string, string) (*service.Offer, error) {
	return s.offer(), nil
}

func (s *stubOfferService) Confirm(_ context.Context, _, _ string, success bool, reason string) (*service.Offer, error) {
	s.success = success
	s.reason = reason
	return s.offer(), nil
}

func newTestServer(t *testing.T) (http.Handler, *stubOfferService, string) {
	t.Helper()

	offers := &stubOfferService{}
	token, err := auth.GenerateToken(testUserID)
	if err != nil {
		t.Fatalf("не удалось выписать токен: %v", err)
	}
	return NewRouter(Dependencies{Offers: offers}), offers, token
}

func do(t *testing.T, handler http.Handler, method, path, token, body string) *httptest.ResponseRecorder {
	t.Helper()

	var reader *strings.Reader
	if body == "" {
		reader = strings.NewReader("")
	} else {
		reader = strings.NewReader(body)
	}

	req := httptest.NewRequest(method, path, reader)
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	req.Header.Set("Content-Type", "application/json")

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	return rec
}

func TestOfferRoutesRequireToken(t *testing.T) {
	handler, _, _ := newTestServer(t)

	paths := []struct {
		method string
		path   string
	}{
		{http.MethodPost, "/api/v1/exchange-offers"},
		{http.MethodGet, "/api/v1/exchange-offers"},
		{http.MethodGet, "/api/v1/exchange-offers/offer-1"},
		{http.MethodPost, "/api/v1/exchange-offers/offer-1/accept"},
		{http.MethodPost, "/api/v1/exchanges/offer-1/confirm"},
	}

	for _, tc := range paths {
		t.Run(tc.method+" "+tc.path, func(t *testing.T) {
			rec := do(t, handler, tc.method, tc.path, "", `{}`)
			if rec.Code != http.StatusUnauthorized {
				t.Errorf("код %d, ожидался 401", rec.Code)
			}
		})
	}
}

func TestCreateOfferTakesInitiatorFromToken(t *testing.T) {
	handler, offers, token := newTestServer(t)

	// В теле чужой отправитель: его быть не должно даже как поля, но если
	// клиент его выдумает, ответ обязан опираться на токен.
	body := `{"offered_product_id":"prod-1","requested_product_id":"prod-2","comment":"готов встретиться"}`
	rec := do(t, handler, http.MethodPost, "/api/v1/exchange-offers", token, body)

	if rec.Code != http.StatusCreated {
		t.Fatalf("код %d, ожидался 201: %s", rec.Code, rec.Body.String())
	}
	if offers.createdBy != testUserID {
		t.Errorf("предложение от %q, ожидалось от владельца токена", offers.createdBy)
	}

	var out CreatedOfferResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
		t.Fatalf("ответ не разобрался: %v", err)
	}
	if out.ID == "" || out.ConversationID != out.ID {
		t.Errorf("переписка должна открываться по тому же идентификатору: %+v", out)
	}
	if out.Status != string(exchange.OfferPending) {
		t.Errorf("статус %q, ожидался pending", out.Status)
	}
}

func TestListParsesRoleAndStatuses(t *testing.T) {
	handler, offers, token := newTestServer(t)

	rec := do(t, handler, http.MethodGet, "/api/v1/exchange-offers?role=incoming&status=pending,accepted", token, "")
	if rec.Code != http.StatusOK {
		t.Fatalf("код %d, ожидался 200: %s", rec.Code, rec.Body.String())
	}
	if offers.role != domain.RoleIncoming {
		t.Errorf("сторона %q, ожидалась incoming", offers.role)
	}
	if len(offers.statuses) != 2 {
		t.Fatalf("статусов %d, ожидалось 2", len(offers.statuses))
	}
}

func TestListRejectsUnknownFilters(t *testing.T) {
	handler, _, token := newTestServer(t)

	cases := []string{
		"/api/v1/exchange-offers?role=both",
		"/api/v1/exchange-offers?status=whatever",
	}

	for _, path := range cases {
		t.Run(path, func(t *testing.T) {
			if rec := do(t, handler, http.MethodGet, path, token, ""); rec.Code != http.StatusBadRequest {
				t.Errorf("код %d, ожидался 400", rec.Code)
			}
		})
	}
}

func TestConfirmAcceptsOnlyKnownResults(t *testing.T) {
	handler, offers, token := newTestServer(t)
	path := "/api/v1/exchanges/44444444-4444-4444-4444-444444444444/confirm"

	if rec := do(t, handler, http.MethodPost, path, token, `{"result":"maybe"}`); rec.Code != http.StatusBadRequest {
		t.Errorf("код %d, ожидался 400 на неизвестный итог", rec.Code)
	}

	rec := do(t, handler, http.MethodPost, path, token, `{"result":"failed","reason":"не договорились"}`)
	if rec.Code != http.StatusOK {
		t.Fatalf("код %d, ожидался 200: %s", rec.Code, rec.Body.String())
	}
	if offers.success {
		t.Error("failed передан как успешный итог")
	}
	if offers.reason != "не договорились" {
		t.Errorf("причина %q, ожидалась переданной в сервис", offers.reason)
	}
}
