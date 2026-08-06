package httpapi

import (
	"github.com/go-chi/chi/v5"
	"net/http"
	"trade-chain/internal/domain"
	"trade-chain/internal/service"
)

type customerHandler struct{ s service.CustomerService }

func mountCustomerRoutes(r chi.Router, s service.CustomerService) {
	h := customerHandler{s}
	r.Route("/customers", func(r chi.Router) {
		r.Post("/", h.create)
		r.Get("/", h.list)
		r.Get("/{id}", h.get)
		r.Patch("/{id}", h.update)
		r.Delete("/{id}", h.delete)
	})
}
func (h customerHandler) create(w http.ResponseWriter, r *http.Request) {
	var v domain.CreateCustomerDTO
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
func (h customerHandler) get(w http.ResponseWriter, r *http.Request) {
	v, e := h.s.GetByID(r.Context(), chi.URLParam(r, "id"))
	if e != nil {
		writeError(w, e)
		return
	}
	writeJSON(w, http.StatusOK, v)
}
func (h customerHandler) update(w http.ResponseWriter, r *http.Request) {
	var v domain.UpdateCustomerDTO
	if decodeJSON(r, &v) != nil {
		writeError(w, service.ErrInvalidInput)
		return
	}
	out, e := h.s.Update(r.Context(), chi.URLParam(r, "id"), &v)
	if e != nil {
		writeError(w, e)
		return
	}
	writeJSON(w, http.StatusOK, out)
}
func (h customerHandler) delete(w http.ResponseWriter, r *http.Request) {
	if e := h.s.Delete(r.Context(), chi.URLParam(r, "id")); e != nil {
		writeError(w, e)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
func (h customerHandler) list(w http.ResponseWriter, r *http.Request) {
	o, l, e := pagination(r)
	if e != nil {
		writeError(w, e)
		return
	}
	v, e := h.s.List(r.Context(), o, l)
	if e != nil {
		writeError(w, e)
		return
	}
	writeJSON(w, http.StatusOK, v)
}
