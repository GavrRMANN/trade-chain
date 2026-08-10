package auth

import (
	"context"
	"errors"
	"net/http"
	"strings"
)

type contextKey string

const UserIDKey contextKey = "user_id"

var ErrInvalidAuthHeader = errors.New("invalid authorization header")

func getUserIDFromRequest(r *http.Request) (string, error) {
	authHeader := r.Header.Get("Authorization")

	if authHeader == "" {
		return "", nil
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return "", ErrInvalidAuthHeader
	}

	claims, err := ValidateToken(parts[1])
	if err != nil {
		return "", err
	}

	return claims.UserID, nil
}

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID, err := getUserIDFromRequest(r)

		if err != nil {
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}

		if userID == "" {
			http.Error(w, "missing authorization header", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(
			r.Context(),
			UserIDKey,
			userID,
		)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func OptionalAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID, err := getUserIDFromRequest(r)

		if err != nil {
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}

		// Нет токена — гость.
		if userID == "" {
			next.ServeHTTP(w, r)
			return
		}

		ctx := context.WithValue(
			r.Context(),
			UserIDKey,
			userID,
		)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func UserIDFromContext(ctx context.Context) (string, bool) {
	userID, ok := ctx.Value(UserIDKey).(string)
	return userID, ok
}
