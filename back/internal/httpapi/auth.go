package httpapi

import (
	"net/http"
	"trade-chain/internal/auth"
	"trade-chain/internal/service"

	"github.com/go-chi/chi/v5"
	"golang.org/x/crypto/bcrypt"
)

type authHandler struct {
	customerService service.CustomerService
}

func mountAuthRoutes(r chi.Router, cs service.CustomerService) {
	h := authHandler{cs}
	r.Route("/auth", func(r chi.Router) {
		r.Post("/login", h.login)
	})
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h authHandler) login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if decodeJSON(r, &req) != nil {
		writeError(w, service.ErrInvalidInput)
		return
	}
	// Получаем пользователя по email
	customer, err := h.customerService.GetByEmail(r.Context(), req.Email)
	if err != nil {
		writeError(w, service.ErrInvalidInput) // скрываем, что пользователь не найден
		return
	}
	// Сравниваем пароль
	if err := bcrypt.CompareHashAndPassword([]byte(customer.PasswordHash), []byte(req.Password)); err != nil {
		writeError(w, service.ErrInvalidInput)
		return
	}
	// Генерируем токен
	token, err := auth.GenerateToken(customer.CustomerID)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"token": token})
}
