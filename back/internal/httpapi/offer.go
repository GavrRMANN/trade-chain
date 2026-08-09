package httpapi

import (
	"context"
	"net/http"
	"strings"
	"time"

	"trade-chain/internal/auth"
	"trade-chain/internal/domain"
	"trade-chain/internal/exchange"
	"trade-chain/internal/service"

	"github.com/go-chi/chi/v5"
)

type offerHandler struct{ s service.OfferService }

// Маршруты предложений закрыты аутентификацией на своём уровне: у каждого
// действия здесь есть автор, и «кто отправил» нельзя брать из тела запроса —
// иначе предложение можно отправить от чужого имени.
func mountExchangeOfferRoutes(r chi.Router, s service.OfferService) {
	h := offerHandler{s}

	r.Route("/exchange-offers", func(r chi.Router) {
		r.Use(auth.AuthMiddleware)

		r.Post("/", h.create)
		r.Get("/", h.list)
		r.Get("/{offerID}", h.details)
		r.Post("/{offerID}/accept", h.accept)
		r.Post("/{offerID}/decline", h.decline)
		r.Post("/{offerID}/cancel", h.cancel)
	})

	r.Route("/exchanges", func(r chi.Router) {
		r.Use(auth.AuthMiddleware)

		r.Post("/{exchangeID}/confirm", h.confirm)
	})
}

// SurchargeBody — доплата, которой стороны выравнивают разницу в стоимости.
type SurchargeBody struct {
	Amount   int     `json:"amount"`
	Currency string  `json:"currency"`
	Payer    *string `json:"payer"`
}

// CreateOfferRequest — предложение обмена одному владельцу.
type CreateOfferRequest struct {
	OfferedProductID   string         `json:"offered_product_id"`
	RequestedProductID string         `json:"requested_product_id"`
	ExchangeGoalID     *string        `json:"exchange_goal_id"`
	RouteStepID        *string        `json:"route_step_id"`
	Surcharge          *SurchargeBody `json:"surcharge"`
	Comment            string         `json:"comment"`
}

// CreatedOfferResponse — короткий ответ на отправку предложения.
type CreatedOfferResponse struct {
	ID             string    `json:"id"`
	Status         string    `json:"status"`
	ConversationID string    `json:"conversation_id"`
	ExpiresAt      time.Time `json:"expires_at"`
}

// OfferResponse — предложение в списке и в карточке.
//
// Идентификаторы предложения, обмена и переписки совпадают: это одно и то же
// звено, и отдавать клиенту три имени одного значения проще, чем заставлять
// его помнить, что они равны.
type OfferResponse struct {
	ID                 string        `json:"id"`
	Status             string        `json:"status"`
	Role               string        `json:"role"`
	OfferedProductID   string        `json:"offered_product_id"`
	RequestedProductID string        `json:"requested_product_id"`
	InitiatorID        string        `json:"initiator_id"`
	RecipientID        string        `json:"recipient_id"`
	ExchangeGoalID     *string       `json:"exchange_goal_id,omitempty"`
	RouteStepID        *string       `json:"route_step_id,omitempty"`
	Surcharge          SurchargeBody `json:"surcharge"`
	Comment            string        `json:"comment,omitempty"`
	ConversationID     string        `json:"conversation_id"`
	ExchangeID         string        `json:"exchange_id,omitempty"`
	ExchangeStatus     string        `json:"exchange_status,omitempty"`
	ExpiresAt          time.Time     `json:"expires_at"`
	CreatedAt          time.Time     `json:"created_at"`
	UpdatedAt          time.Time     `json:"updated_at"`
}

// ConfirmationResponse — решение стороны об итоге обмена.
type ConfirmationResponse struct {
	CustomerID string    `json:"customer_id"`
	Result     string    `json:"result"`
	Reason     string    `json:"reason,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
}

// OfferDetailsResponse — состояние предложения вместе с перепиской.
type OfferDetailsResponse struct {
	OfferResponse
	Messages      []domain.ChainMessage  `json:"messages"`
	Confirmations []ConfirmationResponse `json:"confirmations"`
}

// ConfirmExchangeRequest — итог встречи.
type ConfirmExchangeRequest struct {
	Result string `json:"result"`
	Reason string `json:"reason"`
}

// ExchangeResponse — состояние обмена после подтверждения.
type ExchangeResponse struct {
	ID                 string  `json:"id"`
	Status             string  `json:"status"`
	OfferStatus        string  `json:"offer_status"`
	OfferedProductID   string  `json:"offered_product_id"`
	RequestedProductID string  `json:"requested_product_id"`
	GoalID             *string `json:"goal_id,omitempty"`
}

const (
	resultSuccess = "success"
	resultFailed  = "failed"
)

// create godoc
// @Summary Отправить предложение обмена
// @Description Двустороннее предложение владельцу запрошенного товара. Сервер
// @Description проверяет, что оба товара активны, принадлежат разным людям и
// @Description инициатор владеет предложенным. Поле exchange_goal_id
// @Description необязательно: без него это прямой обмен из карточки товара.
// @Description Повторное предложение по той же паре товаров отдаёт 409.
// @Tags exchange-offers
// @Accept json
// @Produce json
// @Param request body CreateOfferRequest true "Предложение"
// @Success 201 {object} CreatedOfferResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {string} string "unauthorized"
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 409 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /exchange-offers [post]
func (h offerHandler) create(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, service.ErrForbidden)
		return
	}

	var req CreateOfferRequest
	if decodeJSON(r, &req) != nil {
		writeError(w, service.ErrInvalidInput)
		return
	}

	offer, err := h.s.Create(r.Context(), service.CreateOfferInput{
		InitiatorID:        userID,
		OfferedProductID:   req.OfferedProductID,
		RequestedProductID: req.RequestedProductID,
		ExchangeGoalID:     req.ExchangeGoalID,
		RouteStepID:        req.RouteStepID,
		Surcharge:          surchargeOf(req.Surcharge),
		Comment:            req.Comment,
	})
	if err != nil {
		writeError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, CreatedOfferResponse{
		ID:             offer.Chain.ChainID,
		Status:         string(offer.Status),
		ConversationID: offer.Chain.ChainID,
		ExpiresAt:      offer.Chain.ExpiresAt,
	})
}

// list godoc
// @Summary Входящие и исходящие предложения
// @Description Предложения текущего пользователя. Без параметров возвращает
// @Description обе стороны и все состояния.
// @Tags exchange-offers
// @Produce json
// @Param role query string false "Сторона" Enums(incoming, outgoing)
// @Param status query string false "Состояния через запятую" Enums(pending, accepted, declined, cancelled, expired, completed, failed)
// @Success 200 {array} OfferResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {string} string "unauthorized"
// @Failure 403 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /exchange-offers [get]
func (h offerHandler) list(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, service.ErrForbidden)
		return
	}

	role, ok := exchange.ParseRole(r.URL.Query().Get("role"))
	if !ok {
		writeError(w, service.ErrInvalidInput)
		return
	}

	statuses, err := offerStatusesFromQuery(r)
	if err != nil {
		writeError(w, err)
		return
	}

	offers, err := h.s.List(r.Context(), userID, role, statuses)
	if err != nil {
		writeError(w, err)
		return
	}

	out := make([]OfferResponse, 0, len(offers))
	for _, offer := range offers {
		out = append(out, offerResponse(offer, userID))
	}
	writeJSON(w, http.StatusOK, out)
}

// details godoc
// @Summary Детали предложения, чат и состояние
// @Description Карточка предложения целиком. Доступна только его сторонам:
// @Description внутри переписка о встрече.
// @Tags exchange-offers
// @Produce json
// @Param offerID path string true "Offer ID"
// @Success 200 {object} OfferDetailsResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {string} string "unauthorized"
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /exchange-offers/{offerID} [get]
func (h offerHandler) details(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, service.ErrForbidden)
		return
	}

	details, err := h.s.Details(r.Context(), chi.URLParam(r, "offerID"), userID)
	if err != nil {
		writeError(w, err)
		return
	}

	confirmations := make([]ConfirmationResponse, 0, len(details.Confirmations))
	for _, confirmation := range details.Confirmations {
		confirmations = append(confirmations, ConfirmationResponse{
			CustomerID: confirmation.CustomerID,
			Result:     resultOf(confirmation.Success),
			Reason:     confirmation.Reason,
			CreatedAt:  confirmation.CreatedAt,
		})
	}

	writeJSON(w, http.StatusOK, OfferDetailsResponse{
		OfferResponse: offerResponse(details.Offer, userID),
		Messages:      details.Messages,
		Confirmations: confirmations,
	})
}

// accept godoc
// @Summary Принять предложение
// @Description Принять может только владелец запрошенного товара. Принятие
// @Description создаёт обмен в состоянии awaiting_initiator и не меняет
// @Description владение товарами — для этого нужны подтверждения обеих сторон.
// @Tags exchange-offers
// @Produce json
// @Param offerID path string true "Offer ID"
// @Success 200 {object} OfferResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {string} string "unauthorized"
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /exchange-offers/{offerID}/accept [post]
func (h offerHandler) accept(w http.ResponseWriter, r *http.Request) {
	h.decide(w, r, h.s.Accept)
}

// decline godoc
// @Summary Отклонить предложение
// @Description Отказ доступен владельцу запрошенного товара и не отменяет
// @Description остальные предложения по этим вещам.
// @Tags exchange-offers
// @Produce json
// @Param offerID path string true "Offer ID"
// @Success 200 {object} OfferResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {string} string "unauthorized"
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /exchange-offers/{offerID}/decline [post]
func (h offerHandler) decline(w http.ResponseWriter, r *http.Request) {
	h.decide(w, r, h.s.Decline)
}

// cancel godoc
// @Summary Отозвать своё предложение
// @Description Отозвать предложение может только отправитель и только пока
// @Description на него не ответили.
// @Tags exchange-offers
// @Produce json
// @Param offerID path string true "Offer ID"
// @Success 200 {object} OfferResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {string} string "unauthorized"
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /exchange-offers/{offerID}/cancel [post]
func (h offerHandler) cancel(w http.ResponseWriter, r *http.Request) {
	h.decide(w, r, h.s.Cancel)
}

// confirm godoc
// @Summary Подтвердить результат обмена
// @Description Обмен считается состоявшимся только после двух подтверждений:
// @Description при первом success сервер ждёт второго, при втором меняет
// @Description владельцев товаров и закрывает конкурирующие предложения по тем
// @Description же вещам. Для failed достаточно одной стороны — тот, кто приехал
// @Description впустую, не должен зависеть от согласия второй.
// @Tags exchanges
// @Accept json
// @Produce json
// @Param exchangeID path string true "Exchange ID (совпадает с ID предложения)"
// @Param request body ConfirmExchangeRequest true "Итог встречи"
// @Success 200 {object} ExchangeResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {string} string "unauthorized"
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 409 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /exchanges/{exchangeID}/confirm [post]
func (h offerHandler) confirm(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, service.ErrForbidden)
		return
	}

	var req ConfirmExchangeRequest
	if decodeJSON(r, &req) != nil {
		writeError(w, service.ErrInvalidInput)
		return
	}
	if req.Result != resultSuccess && req.Result != resultFailed {
		writeError(w, service.ErrInvalidInput)
		return
	}

	offer, err := h.s.Confirm(r.Context(), chi.URLParam(r, "exchangeID"), userID, req.Result == resultSuccess, req.Reason)
	if err != nil {
		writeError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, ExchangeResponse{
		ID:                 offer.Chain.ChainID,
		Status:             string(offer.Exchange),
		OfferStatus:        string(offer.Status),
		OfferedProductID:   offer.Chain.FromProductID,
		RequestedProductID: offer.Chain.ToProductID,
		GoalID:             offer.Chain.ExchangeGoalID,
	})
}

// decide обслуживает accept, decline и cancel: у них общий вид запроса
// и ответа, а разрешения проверяет сервис.
func (h offerHandler) decide(
	w http.ResponseWriter,
	r *http.Request,
	action func(ctx context.Context, offerID, actorID string) (*service.Offer, error),
) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, service.ErrForbidden)
		return
	}

	offer, err := action(r.Context(), chi.URLParam(r, "offerID"), userID)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, offerResponse(*offer, userID))
}

// offerStatusesFromQuery разбирает ?status=pending,accepted и повторяющийся
// ?status=. Неизвестное значение — ошибка запроса, а не молчаливый пропуск:
// иначе опечатка вернёт список, который клиент примет за полный.
func offerStatusesFromQuery(r *http.Request) ([]exchange.OfferStatus, error) {
	values := r.URL.Query()["status"]
	statuses := make([]exchange.OfferStatus, 0, len(values))

	for _, value := range values {
		for _, part := range strings.Split(value, ",") {
			part = strings.TrimSpace(part)
			if part == "" {
				continue
			}
			status, known := exchange.ParseOfferStatus(part)
			if !known {
				return nil, service.ErrInvalidInput
			}
			statuses = append(statuses, status)
		}
	}
	return statuses, nil
}

func offerResponse(offer service.Offer, viewerID string) OfferResponse {
	chain := offer.Chain

	out := OfferResponse{
		ID:                 chain.ChainID,
		Status:             string(offer.Status),
		Role:               string(roleOf(chain, viewerID)),
		OfferedProductID:   chain.FromProductID,
		RequestedProductID: chain.ToProductID,
		InitiatorID:        chain.InitiatorID,
		RecipientID:        chain.RecipientID,
		ExchangeGoalID:     chain.ExchangeGoalID,
		RouteStepID:        chain.RouteStepID,
		Surcharge: SurchargeBody{
			Amount:   chain.Surcharge.Amount,
			Currency: chain.Surcharge.Currency,
			Payer:    chain.Surcharge.Payer,
		},
		Comment:        chain.Message,
		ConversationID: chain.ChainID,
		ExpiresAt:      chain.ExpiresAt,
		CreatedAt:      chain.CreatedAt,
		UpdatedAt:      chain.UpdatedAt,
	}

	// Обмена нет, пока предложение не приняли: пустые поля честнее, чем
	// идентификатор сделки, которой ещё не существует.
	if offer.Exchange != "" {
		out.ExchangeID = chain.ChainID
		out.ExchangeStatus = string(offer.Exchange)
	}
	return out
}

// roleOf отвечает на вопрос смотрящего «это мне предложили или я предложил».
func roleOf(chain domain.Chain, viewerID string) domain.OfferRole {
	if chain.InitiatorID == viewerID {
		return domain.RoleOutgoing
	}
	return domain.RoleIncoming
}

func surchargeOf(body *SurchargeBody) domain.Surcharge {
	if body == nil {
		return domain.Surcharge{}
	}
	return domain.Surcharge{
		Amount:   body.Amount,
		Currency: body.Currency,
		Payer:    body.Payer,
	}
}

func resultOf(success bool) string {
	if success {
		return resultSuccess
	}
	return resultFailed
}
