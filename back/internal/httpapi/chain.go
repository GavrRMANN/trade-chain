package httpapi

import (
	"net/http"
	"trade-chain/internal/auth"
	"trade-chain/internal/domain"
	"trade-chain/internal/service"

	"github.com/go-chi/chi/v5"
)

type chainHandler struct{ s service.ChainService }
type chainStatusRequest struct {
	Status domain.ChainStatus `json:"status"`
}

func mountChainRoutes(r chi.Router, s service.ChainService) {
	h := chainHandler{s}
	r.Route("/chains", func(r chi.Router) {
		r.Post("/", h.create)
		r.Get("/{id}", h.get)
		r.Get("/{id}/full", h.full)
		r.Patch("/{id}/status", h.status)
		r.Delete("/{id}", h.delete)
		r.Get("/by-product/{productID}", h.byProduct)
	})
}

func (h chainHandler) create(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, service.ErrForbidden)
		return
	}

	var v domain.Chain
	if decodeJSON(r, &v) != nil {
		writeError(w, service.ErrInvalidInput)
		return
	}
	v.InitiatorID = userID // устанавливаем инициатора из токена

	out, err := h.s.Create(r.Context(), &v)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, out)
}

func (h chainHandler) get(w http.ResponseWriter, r *http.Request) {
	v, err := h.s.GetByID(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, v)
}

func (h chainHandler) full(w http.ResponseWriter, r *http.Request) {
	v, err := h.s.GetFullChain(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, v)
}

func (h chainHandler) byProduct(w http.ResponseWriter, r *http.Request) {
	v, err := h.s.GetByProductID(r.Context(), chi.URLParam(r, "productID"))
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, v)
}

func (h chainHandler) status(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, service.ErrForbidden)
		return
	}

	var req chainStatusRequest
	if decodeJSON(r, &req) != nil {
		writeError(w, service.ErrInvalidInput)
		return
	}
	if err := h.s.UpdateStatus(r.Context(), chi.URLParam(r, "id"), req.Status, userID); err != nil {
		writeError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h chainHandler) delete(w http.ResponseWriter, r *http.Request) {
	if err := h.s.Delete(r.Context(), chi.URLParam(r, "id")); err != nil {
		writeError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
