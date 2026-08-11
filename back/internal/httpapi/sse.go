package httpapi

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"trade-chain/internal/auth"
	"trade-chain/internal/events"
)

type eventsHandler struct{ broker *events.Broker }

func (h eventsHandler) stream(w http.ResponseWriter, r *http.Request) {
	customerID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		http.Error(w, "missing authorization header", http.StatusUnauthorized)
		return
	}

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming is unsupported", http.StatusInternalServerError)
		return
	}

	eventsCh, unsubscribe, subscribed := h.broker.Subscribe(customerID)
	if !subscribed {
		http.Error(w, "too many event connections", http.StatusTooManyRequests)
		return
	}
	defer unsubscribe()

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")
	w.WriteHeader(http.StatusOK)
	flusher.Flush()

	heartbeat := time.NewTicker(25 * time.Second)
	defer heartbeat.Stop()
	var tokenExpires <-chan time.Time
	if expiration, ok := auth.TokenExpirationFromContext(r.Context()); ok {
		timer := time.NewTimer(time.Until(expiration))
		defer timer.Stop()
		tokenExpires = timer.C
	}

	for {
		select {
		case <-r.Context().Done():
			return
		case <-tokenExpires:
			return
		case <-heartbeat.C:
			if _, err := fmt.Fprint(w, ": keepalive\n\n"); err != nil {
				return
			}
			flusher.Flush()
		case event := <-eventsCh:
			payload, err := json.Marshal(event)
			if err != nil {
				continue
			}
			if _, err = fmt.Fprintf(w, "event: %s\ndata: %s\n\n", event.Type, payload); err != nil {
				return
			}
			flusher.Flush()
		}
	}
}
