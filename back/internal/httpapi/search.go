package httpapi

import (
	"net/http"
	"strconv"
	"trade-chain/internal/auth"
	"trade-chain/internal/search"
	"trade-chain/internal/service"

	"github.com/go-chi/chi/v5"
)

type searchHandler struct {
	s *search.SearchService
}

func mountSearchRoutes(r chi.Router, s *search.SearchService) {
	h := searchHandler{s}
	r.Route("/search", func(r chi.Router) {
		r.Get("/chain", h.findChain)
	})
}

func (h searchHandler) findChain(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, service.ErrForbidden)
		return
	}

	targetProductID := r.URL.Query().Get("target_product_id")
	if targetProductID == "" {
		writeError(w, service.ErrInvalidInput)
		return
	}

	maxDepthStr := r.URL.Query().Get("max_depth")
	maxDepth := 10 // default
	if maxDepthStr != "" {
		if d, err := strconv.Atoi(maxDepthStr); err == nil && d > 0 {
			maxDepth = d
		}
	}

	result, err := h.s.FindChain(r.Context(), userID, targetProductID, maxDepth)
	if err != nil {
		writeError(w, err)
		return
	}
	if result == nil {
		writeJSON(w, http.StatusOK, map[string]interface{}{"chain": []interface{}{}, "length": 0})
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"chain":  result.Products,
		"length": result.Length,
	})
}
