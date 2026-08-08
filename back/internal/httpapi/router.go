package httpapi

import (
	"log"
	"net/http"
	"time"
	"trade-chain/internal/search"
	"trade-chain/internal/service"

	_ "trade-chain/docs"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	httpSwagger "github.com/swaggo/http-swagger"
)

type Dependencies struct {
	Customers  service.CustomerService
	Products   service.ProductService
	Chains     service.ChainService
	Reviews    service.ReviewService
	Categories service.CategoryService
	Wishlists  service.WishlistService
	Search     *search.SearchService
}

func NewRouter(d Dependencies) http.Handler {
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{
			"http://localhost:3000",
			"http://localhost:5173",
		},
		AllowedMethods: []string{
			"GET",
			"POST",
			"PUT",
			"PATCH",
			"DELETE",
			"OPTIONS",
		},
		AllowedHeaders: []string{
			"Accept",
			"Authorization",
			"Content-Type",
		},
	}))

	// Middleware
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(15 * time.Second))

	// Health check
	r.Get("/health", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	// Swagger UI
	r.Get("/swagger/*", httpSwagger.Handler(
		httpSwagger.URL("/swagger/doc.json"),
	))

	// Создаём обработчик для аутентификации
	authHandler := NewAuthHandler(d.Customers)

	// Все маршруты. Верификацию делаю внутри маунтов
	r.Route("/api/v1", func(r chi.Router) {

		authHandler.mountAuth(r) // /auth/login, /auth/register

		if d.Customers != nil {
			mountCustomerRoutes(r, d.Customers)
		}
		if d.Products != nil {
			mountProductRoutes(r, d.Products, d.Wishlists, d.Search)
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

	chi.Walk(r, func(
		method string,
		route string,
		handler http.Handler,
		middlewares ...func(http.Handler) http.Handler,
	) error {
		log.Printf("ROUTE %s %s middleware=%d", method, route, len(middlewares))
		return nil
	})
	return r
}
