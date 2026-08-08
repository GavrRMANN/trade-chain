package httpapi

import (
	"net/http"
	"trade-chain/internal/auth"
	"trade-chain/internal/domain"
	"trade-chain/internal/service"

	"github.com/go-chi/chi/v5"
	"golang.org/x/crypto/bcrypt"
)

type authHandler struct {
	customerService service.CustomerService
}

func NewAuthHandler(cs service.CustomerService) *authHandler {
	return &authHandler{customerService: cs}
}

func (h *authHandler) MountPublic(r chi.Router) {
	r.Route("/auth", func(r chi.Router) {
		r.Post("/login", h.login)
		r.Post("/register", h.register)
	})
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	User  domain.Customer `json:"user"`
	Token string          `json:"token"`
}
// register godoc
// @Summary Register user
// @Description Register a new customer
// @Tags auth
// @Accept json
// @Produce json
// @Param request body domain.CreateCustomerDTO true "Registration data"
// @Success 201 {object} domain.Customer
// @Failure 400 {object} ErrorResponse
// @Failure 409 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /auth/register [post]
func (h authHandler) register(w http.ResponseWriter, r *http.Request) {
	var req domain.CreateCustomerDTO
	if decodeJSON(r, &req) != nil {
		writeError(w, service.ErrInvalidInput)
		return
	}

	customer, err := h.customerService.Create(r.Context(), &req)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, customer)
}

// login godoc
// @Summary Login user
// @Description Authenticate user and return JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body LoginRequest true "Login credentials"
// @Success 200 {object} AuthResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /auth/login [post]
func (h *authHandler) login(w http.ResponseWriter, r *http.Request) {
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
	writeJSON(w, http.StatusOK, AuthResponse{User: *customer, Token: token})
}

// register godoc
// @Summary Register user
// @Description Register a new user and return JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body domain.CreateCustomerDTO true "Registration data"
// @Success 201 {object} AuthResponse
// @Failure 400 {object} ErrorResponse
// @Failure 409 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /auth/register [post]
func (h *authHandler) register(w http.ResponseWriter, r *http.Request) {
	var req domain.CreateCustomerDTO
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, service.ErrInvalidInput)
		return
	}
	customer, err := h.customerService.Create(r.Context(), &req)
	if err != nil {
		writeError(w, err)
		return
	}
	token, err := auth.GenerateToken(customer.CustomerID)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, AuthResponse{User: *customer, Token: token})
}

// me godoc
// @Summary Get current user info
// @Description Get information about the authenticated user (validates token)
// @Tags auth
// @Accept json
// @Produce json
// @Success 200 {object} domain.Customer
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /auth/me [get]
func (h *authHandler) me(w http.ResponseWriter, r *http.Request) {
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, service.ErrForbidden)
		return
	}
	customer, err := h.customerService.GetByID(r.Context(), userID)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, customer)
}
