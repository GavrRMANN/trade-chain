package httpapi

import (
	"github.com/go-chi/chi/v5"
	"net/http"
	"trade-chain/internal/domain"
	"trade-chain/internal/service"
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
	var v domain.Chain
	if decodeJSON(r, &v) != nil {
		writeError(w, service.ErrInvalidInput)
		return
	}
	out, e := h.s.Create(r.Context(), &v)
	if e != nil {
		writeError(w, e)
		return
	}
	writeJSON(w, http.StatusCreated, out)
}
func (h chainHandler) get(w http.ResponseWriter, r *http.Request) {
	v, e := h.s.GetByID(r.Context(), chi.URLParam(r, "id"))
	if e != nil {
		writeError(w, e)
		return
	}
	writeJSON(w, http.StatusOK, v)
}
func (h chainHandler) full(w http.ResponseWriter, r *http.Request) {
	v, e := h.s.GetFullChain(r.Context(), chi.URLParam(r, "id"))
	if e != nil {
		writeError(w, e)
		return
	}
	writeJSON(w, http.StatusOK, v)
}
func (h chainHandler) byProduct(w http.ResponseWriter, r *http.Request) {
	v, e := h.s.GetByProductID(r.Context(), chi.URLParam(r, "productID"))
	if e != nil {
		writeError(w, e)
		return
	}
	writeJSON(w, http.StatusOK, v)
}
func (h chainHandler) status(w http.ResponseWriter, r *http.Request) {
	var v chainStatusRequest
	if decodeJSON(r, &v) != nil {
		writeError(w, service.ErrInvalidInput)
		return
	}
	if e := h.s.UpdateStatus(r.Context(), chi.URLParam(r, "id"), v.Status); e != nil {
		writeError(w, e)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
func (h chainHandler) delete(w http.ResponseWriter, r *http.Request) {
	if e := h.s.Delete(r.Context(), chi.URLParam(r, "id")); e != nil {
		writeError(w, e)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
