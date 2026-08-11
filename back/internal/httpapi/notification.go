package httpapi

import (
	"net/http"

	"trade-chain/internal/auth"
	"trade-chain/internal/domain"
	"trade-chain/internal/service"

	"github.com/go-chi/chi/v5"
)

type notificationHandler struct{ s service.NotificationService }

type markNotificationReadRequest struct {
	Kind domain.NotificationKind `json:"kind"`
}

func mountNotificationRoutes(r chi.Router, s service.NotificationService) {
	h := notificationHandler{s: s}
	r.Route("/notifications", func(r chi.Router) {
		r.Use(auth.AuthMiddleware)
		r.Get("/read-statuses", h.listReads)
		r.Put("/read-all", h.markAllRead)
		r.Put("/{chainID}/read", h.markRead)
	})
}

func (h notificationHandler) markAllRead(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, service.ErrForbidden)
		return
	}
	if err := h.s.MarkAllRead(r.Context(), userID); err != nil {
		writeError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h notificationHandler) listReads(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, service.ErrForbidden)
		return
	}
	reads, err := h.s.ListReads(r.Context(), userID)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, reads)
}

func (h notificationHandler) markRead(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, service.ErrForbidden)
		return
	}
	var request markNotificationReadRequest
	if decodeJSON(r, &request) != nil {
		writeError(w, service.ErrInvalidInput)
		return
	}
	if err := h.s.MarkRead(r.Context(), userID, chi.URLParam(r, "chainID"), request.Kind); err != nil {
		writeError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
