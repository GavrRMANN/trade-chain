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

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// login godoc
// @Summary Login user
// @Description Authenticate user and return JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body LoginRequest true "Login credentials"
// @Success 200 {object} map[string]string "token"
// @Failure 400 {object} ErrorResponse "Invalid input"
// @Failure 500 {object} ErrorResponse "Internal server error"
// @Router /auth/login [post]
func (h authHandler) login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if decodeJSON(r, &req) != nil {
		writeError(w, service.ErrInvalidInput)
		return
	}
	customer, err := h.customerService.GetByEmail(r.Context(), req.Email)
	if err != nil {
		writeError(w, service.ErrInvalidInput)
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(customer.PasswordHash), []byte(req.Password)); err != nil {
		writeError(w, service.ErrInvalidInput)
		return
	}
	token, err := auth.GenerateToken(customer.CustomerID)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"token": token})
}
