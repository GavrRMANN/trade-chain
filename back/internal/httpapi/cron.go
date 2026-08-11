package httpapi

import (
	"crypto/subtle"
	"net/http"

	"trade-chain/internal/service"

	"github.com/go-chi/chi/v5"
)

type expirationHandler struct {
	chains service.ChainService
	secret []byte
}

func mountExpirationRoute(r chi.Router, chains service.ChainService, secret string) {
	if chains == nil || secret == "" {
		return
	}
	h := expirationHandler{chains: chains, secret: []byte(secret)}
	r.Post("/internal/cron/expire-offers", h.expire)
}

func (h expirationHandler) expire(w http.ResponseWriter, r *http.Request) {
	token := []byte(r.Header.Get("Authorization"))
	expected := append([]byte("Bearer "), h.secret...)
	if subtle.ConstantTimeCompare(token, expected) != 1 {
		writeJSON(w, http.StatusUnauthorized, ErrorResponse{Error: "unauthorized"})
		return
	}
	if err := h.chains.ExpireOffers(r.Context()); err != nil {
		writeError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
