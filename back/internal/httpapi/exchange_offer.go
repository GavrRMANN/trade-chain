package httpapi

import (
	"net/http"
	"trade-chain/internal/auth"
	"trade-chain/internal/domain"
	"trade-chain/internal/service"

	"github.com/go-chi/chi/v5"
)

type exchangeOfferHandler struct {
	chainService   service.ChainService
	productService service.ProductService
}

func mountExchangeOfferRoutes(r chi.Router, chainSvc service.ChainService, productSvc service.ProductService) {
	h := &exchangeOfferHandler{chainService: chainSvc, productService: productSvc}
	r.Route("/exchange-offers", func(r chi.Router) {
		r.Post("/", h.create)
		r.Get("/", h.list)
		r.Get("/{offerId}", h.get)
		r.Post("/{offerId}/accept", h.accept)
		r.Post("/{offerId}/decline", h.decline)
		r.Post("/{offerId}/cancel", h.cancel)
	})
}

// CreateOfferRequest — тело запроса на создание предложения.
type CreateOfferRequest struct {
	OfferedProductID   string            `json:"offered_product_id"`
	RequestedProductID string            `json:"requested_product_id"`
	ExchangeGoalID     *string           `json:"exchange_goal_id,omitempty"`
	RouteStepID        *string           `json:"route_step_id,omitempty"`
	Surcharge          *domain.Surcharge `json:"surcharge,omitempty"`
	Comment            string            `json:"comment,omitempty"`
}

// create godoc
// @Summary Отправить предложение
// @Description Создать новое двустороннее предложение.
// @Tags exchange-offers
// @Accept json
// @Produce json
// @Param request body CreateOfferRequest true "Данные предложения"
// @Success 201 {object} domain.Chain
// @Failure 400 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 409 {object} ErrorResponse
// @Router /exchange-offers [post]
func (h *exchangeOfferHandler) create(w http.ResponseWriter, r *http.Request) {
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
	if req.OfferedProductID == "" || req.RequestedProductID == "" {
		writeError(w, service.ErrInvalidInput)
		return
	}

	chain, err := h.chainService.CreateOffer(
		r.Context(),
		req.OfferedProductID,
		req.RequestedProductID,
		userID,
		req.ExchangeGoalID,
		req.RouteStepID,
		req.Surcharge,
		req.Comment,
	)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, chain)
}

// list godoc
// @Summary Список предложений
// @Description Возвращает входящие или исходящие предложения с фильтром по статусу.
// @Tags exchange-offers
// @Produce json
// @Param role query string false "incoming или outgoing"
// @Param status query string false "статус (pending, accepted, declined, cancelled, expired, completed)"
// @Success 200 {array} domain.Chain
// @Failure 403 {object} ErrorResponse
// @Router /exchange-offers [get]
func (h *exchangeOfferHandler) list(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, service.ErrForbidden)
		return
	}
	role := r.URL.Query().Get("role")
	status := r.URL.Query().Get("status")
	chains, err := h.chainService.ListOffers(r.Context(), userID, role, status)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, chains)
}

// get godoc
// @Summary Детали предложения
// @Description Получить полную информацию о предложении.
// @Tags exchange-offers
// @Produce json
// @Param offerId path string true "ID предложения"
// @Success 200 {object} domain.Chain
// @Failure 403 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /exchange-offers/{offerId} [get]
func (h *exchangeOfferHandler) get(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, service.ErrForbidden)
		return
	}
	offerID := chi.URLParam(r, "offerId")
	chain, err := h.chainService.GetByID(r.Context(), offerID)
	if err != nil {
		writeError(w, err)
		return
	}
	// Проверяем, что пользователь участвует
	if chain.InitiatorID != userID && chain.RecipientID != userID {
		writeError(w, service.ErrForbidden)
		return
	}
	writeJSON(w, http.StatusOK, chain)
}

// accept godoc
// @Summary Принять предложение
// @Description Принять входящее предложение.
// @Tags exchange-offers
// @Produce json
// @Param offerId path string true "ID предложения"
// @Success 200 {object} domain.Chain
// @Failure 400 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 409 {object} ErrorResponse
// @Router /exchange-offers/{offerId}/accept [post]
func (h *exchangeOfferHandler) accept(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, service.ErrForbidden)
		return
	}
	offerID := chi.URLParam(r, "offerId")
	chain, err := h.chainService.AcceptOffer(r.Context(), offerID, userID)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, chain)
}

// decline godoc
// @Summary Отклонить предложение
// @Description Отклонить входящее предложение.
// @Tags exchange-offers
// @Produce json
// @Param offerId path string true "ID предложения"
// @Success 200 {object} domain.Chain
// @Failure 400 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 409 {object} ErrorResponse
// @Router /exchange-offers/{offerId}/decline [post]
func (h *exchangeOfferHandler) decline(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, service.ErrForbidden)
		return
	}
	offerID := chi.URLParam(r, "offerId")
	chain, err := h.chainService.DeclineOffer(r.Context(), offerID, userID)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, chain)
}

// cancel godoc
// @Summary Отозвать предложение
// @Description Отозвать своё исходящее предложение.
// @Tags exchange-offers
// @Produce json
// @Param offerId path string true "ID предложения"
// @Success 200 {object} domain.Chain
// @Failure 400 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 409 {object} ErrorResponse
// @Router /exchange-offers/{offerId}/cancel [post]
func (h *exchangeOfferHandler) cancel(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, service.ErrForbidden)
		return
	}
	offerID := chi.URLParam(r, "offerId")
	chain, err := h.chainService.CancelOffer(r.Context(), offerID, userID)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, chain)
}
