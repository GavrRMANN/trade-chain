package httpapi

import (
	"github.com/go-chi/chi/v5"
	"net/http"
	"trade-chain/internal/domain"
	"trade-chain/internal/service"
)

type categoryHandler struct{ s service.CategoryService }

func mountCategoryRoutes(r chi.Router, s service.CategoryService) {
	h := categoryHandler{s}
	r.Route("/categories", func(r chi.Router) {
		r.Post("/", h.create)
		r.Get("/", h.list)
		r.Get("/{id}", h.get)
		r.Get("/{id}/subcategories", h.subcategories)
		r.Put("/{id}", h.update)
		r.Delete("/{id}", h.delete)
	})
}
func (h categoryHandler) create(w http.ResponseWriter, r *http.Request) {
	var v domain.Category
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
func (h categoryHandler) get(w http.ResponseWriter, r *http.Request) {
	v, e := h.s.GetByID(r.Context(), chi.URLParam(r, "id"))
	if e != nil {
		writeError(w, e)
		return
	}
	writeJSON(w, http.StatusOK, v)
}
func (h categoryHandler) subcategories(w http.ResponseWriter, r *http.Request) {
	v, e := h.s.GetSubcategories(r.Context(), chi.URLParam(r, "id"))
	if e != nil {
		writeError(w, e)
		return
	}
	writeJSON(w, http.StatusOK, v)
}
func (h categoryHandler) update(w http.ResponseWriter, r *http.Request) {
	var v domain.Category
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
func (h categoryHandler) delete(w http.ResponseWriter, r *http.Request) {
	if e := h.s.Delete(r.Context(), chi.URLParam(r, "id")); e != nil {
		writeError(w, e)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
func (h categoryHandler) list(w http.ResponseWriter, r *http.Request) {
	v, e := h.s.List(r.Context())
	if e != nil {
		writeError(w, e)
		return
	}
	writeJSON(w, http.StatusOK, v)
}
