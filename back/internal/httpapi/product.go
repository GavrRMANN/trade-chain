package httpapi

import (
	"github.com/go-chi/chi/v5"
	"net/http"
	"trade-chain/internal/domain"
	"trade-chain/internal/service"
)

type productHandler struct{ s service.ProductService }

func mountProductRoutes(r chi.Router, s service.ProductService) {
	h := productHandler{s}
	r.Route("/products", func(r chi.Router) {
		r.Post("/", h.create)
		r.Get("/", h.list)
		r.Get("/search", h.search)
		r.Get("/{id}", h.get)
		r.Patch("/{id}", h.update)
		r.Delete("/{id}", h.delete)
		r.Get("/by-customer/{customerID}", h.byCustomer)
	})
}
func (h productHandler) create(w http.ResponseWriter, r *http.Request) {
	var v domain.CreateProductDTO
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
func (h productHandler) get(w http.ResponseWriter, r *http.Request) {
	v, e := h.s.GetByID(r.Context(), chi.URLParam(r, "id"))
	if e != nil {
		writeError(w, e)
		return
	}
	writeJSON(w, http.StatusOK, v)
}
func (h productHandler) update(w http.ResponseWriter, r *http.Request) {
	var v domain.UpdateProductDTO
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
func (h productHandler) delete(w http.ResponseWriter, r *http.Request) {
	if e := h.s.Delete(r.Context(), chi.URLParam(r, "id")); e != nil {
		writeError(w, e)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
func (h productHandler) list(w http.ResponseWriter, r *http.Request) {
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
func (h productHandler) search(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	var category *string
	if v := r.URL.Query().Get("category_id"); v != "" {
		category = &v
	}
	out, e := h.s.Search(r.Context(), q, category)
	if e != nil {
		writeError(w, e)
		return
	}
	writeJSON(w, http.StatusOK, out)
}
func (h productHandler) byCustomer(w http.ResponseWriter, r *http.Request) {
	v, e := h.s.GetByCustomerID(r.Context(), chi.URLParam(r, "customerID"))
	if e != nil {
		writeError(w, e)
		return
	}
	writeJSON(w, http.StatusOK, v)
}
