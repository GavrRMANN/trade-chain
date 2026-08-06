package httpapi

import (
	"github.com/go-chi/chi/v5"
	"net/http"
	"trade-chain/internal/domain"
	"trade-chain/internal/service"
)

type wishlistHandler struct{ s service.WishlistService }
type optionRequest struct {
	CategoryID string `json:"category_id"`
}

func mountWishlistRoutes(r chi.Router, s service.WishlistService) {
	h := wishlistHandler{s}
	r.Route("/wishlists", func(r chi.Router) {
		r.Post("/", h.create)
		r.Get("/{id}", h.get)
		r.Delete("/{id}", h.delete)
		r.Get("/{id}/options", h.options)
		r.Post("/{id}/options", h.addOption)
		r.Delete("/{id}/options/{categoryID}", h.removeOption)
		r.Get("/by-product/{productID}", h.byProduct)
	})
}
func (h wishlistHandler) create(w http.ResponseWriter, r *http.Request) {
	var v domain.Wishlist
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
func (h wishlistHandler) get(w http.ResponseWriter, r *http.Request) {
	v, e := h.s.GetByID(r.Context(), chi.URLParam(r, "id"))
	if e != nil {
		writeError(w, e)
		return
	}
	writeJSON(w, http.StatusOK, v)
}
func (h wishlistHandler) byProduct(w http.ResponseWriter, r *http.Request) {
	v, e := h.s.GetByProductID(r.Context(), chi.URLParam(r, "productID"))
	if e != nil {
		writeError(w, e)
		return
	}
	writeJSON(w, http.StatusOK, v)
}
func (h wishlistHandler) delete(w http.ResponseWriter, r *http.Request) {
	if e := h.s.Delete(r.Context(), chi.URLParam(r, "id")); e != nil {
		writeError(w, e)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
func (h wishlistHandler) options(w http.ResponseWriter, r *http.Request) {
	v, e := h.s.GetOptions(r.Context(), chi.URLParam(r, "id"))
	if e != nil {
		writeError(w, e)
		return
	}
	writeJSON(w, http.StatusOK, v)
}
func (h wishlistHandler) addOption(w http.ResponseWriter, r *http.Request) {
	var v optionRequest
	if decodeJSON(r, &v) != nil {
		writeError(w, service.ErrInvalidInput)
		return
	}
	if e := h.s.AddCategoryOption(r.Context(), chi.URLParam(r, "id"), v.CategoryID); e != nil {
		writeError(w, e)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
func (h wishlistHandler) removeOption(w http.ResponseWriter, r *http.Request) {
	if e := h.s.RemoveCategoryOption(r.Context(), chi.URLParam(r, "id"), chi.URLParam(r, "categoryID")); e != nil {
		writeError(w, e)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
