package httpapi

import (
	"net/http"
	"time"
	"trade-chain/internal/service"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type Dependencies struct {
	Customers  service.CustomerService
	Products   service.ProductService
	Chains     service.ChainService
	Reviews    service.ReviewService
	Categories service.CategoryService
	Wishlists  service.WishlistService
}

func NewRouter(d Dependencies) http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(15 * time.Second))

	r.Get("/health", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	r.Route("/api/v1", func(r chi.Router) {
		if d.Customers != nil {
			mountCustomerRoutes(r, d.Customers)
		}
		if d.Products != nil {
			mountProductRoutes(r, d.Products)
		}
		if d.Chains != nil {
			mountChainRoutes(r, d.Chains)
		}
		if d.Reviews != nil {
			mountReviewRoutes(r, d.Reviews)
		}
		if d.Categories != nil {
			mountCategoryRoutes(r, d.Categories)
		}
		if d.Wishlists != nil {
			mountWishlistRoutes(r, d.Wishlists)
		}
	})
	return r
}
