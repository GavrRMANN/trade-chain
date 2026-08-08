package httpapi

import (
	"net/http"
	"trade-chain/internal/auth"
	"trade-chain/internal/service"

	"github.com/go-chi/chi/v5"
)

type exchangeHandler struct {
	chainService service.ChainService
}

func mountExchangeRoutes(r chi.Router, chainSvc service.ChainService) {
	h := &exchangeHandler{chainService: chainSvc}
	r.Route("/exchanges", func(r chi.Router) {
		r.Post("/{exchangeId}/confirm", h.confirm)
	})
}

// ConfirmRequest — тело запроса подтверждения.
type ConfirmRequest struct {
	Result string `json:"result"` // "success" или "failed"
	Reason string `json:"reason,omitempty"`
}

// confirm godoc
// @Summary Подтвердить результат обмена
// @Description Подтвердить итог встречи. Обе стороны должны вызвать этот эндпоинт.
// @Tags exchanges
// @Accept json
// @Produce json
// @Param exchangeId path string true "ID обмена (то же, что chain_id)"
// @Param request body ConfirmRequest true "Результат"
// @Success 200 {object} domain.Chain
// @Failure 400 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 409 {object} ErrorResponse
// @Router /exchanges/{exchangeId}/confirm [post]
func (h *exchangeHandler) confirm(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, service.ErrForbidden)
		return
	}
	exchangeID := chi.URLParam(r, "exchangeId")
	var req ConfirmRequest
	if decodeJSON(r, &req) != nil {
		writeError(w, service.ErrInvalidInput)
		return
	}
	success := req.Result == "success"
	chain, err := h.chainService.Confirm(r.Context(), exchangeID, userID, success)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, chain)
}
