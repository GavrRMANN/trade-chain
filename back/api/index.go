// Package handler — точка входа под Go-рантайм Vercel.
//
// Тот же роутер, что и в cmd/app, только вместо ListenAndServe его дёргает
// платформа. Пул и зависимости собираются один раз на инстанс: между тёплыми
// вызовами процесс живёт, и переподключаться к базе на каждый запрос незачем.
package handler

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"sync"

	"trade-chain/internal/httpapi"
	"trade-chain/internal/repository"
	"trade-chain/internal/search"
	"trade-chain/internal/service"

	"github.com/jackc/pgx/v5/pgxpool"
)

var errNoDatabaseURL = errors.New("DATABASE_URL is not set")

var (
	once    sync.Once
	router  http.Handler
	initErr error
)

func build() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		initErr = errNoDatabaseURL
		return
	}

	ctx := context.Background()

	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		initErr = err
		return
	}
	if err := pool.Ping(ctx); err != nil {
		initErr = err
		return
	}

	customerRepo := repository.NewCustomerRepository(pool)
	productRepo := repository.NewProductRepository(pool)
	categoryRepo := repository.NewCategoryRepository(pool)
	wishlistRepo := repository.NewWishlistRepository(pool)
	chainRepo := repository.NewChainRepository(pool)
	negotiationRepo := repository.NewNegotiationRepository(pool)
	reviewRepo := repository.NewReviewRepository(pool)

	customerService := service.NewCustomerService(customerRepo)
	productService := service.NewProductService(productRepo, customerRepo)
	categoryService := service.NewCategoryService(categoryRepo)
	wishlistService := service.NewWishlistService(wishlistRepo, productRepo)
	chainService := service.NewChainService(chainRepo, productRepo, negotiationRepo)
	offerService := service.NewOfferService(chainService, chainRepo, negotiationRepo)
	reviewService := service.NewReviewService(reviewRepo, customerRepo, productRepo, chainService)
	searchService := search.NewSearchService(productService, categoryService)

	router = httpapi.NewRouter(httpapi.Dependencies{
		Customers:  customerService,
		Products:   productService,
		Chains:     chainService,
		Offers:     offerService,
		Reviews:    reviewService,
		Categories: categoryService,
		Wishlists:  wishlistService,
		Search:     searchService,
	})
}

// Handler — то, что вызывает Vercel на каждый входящий запрос.
func Handler(w http.ResponseWriter, r *http.Request) {
	once.Do(build)

	if initErr != nil {
		log.Printf("init failed: %v", initErr)
		http.Error(w, `{"error":"backend is not configured"}`, http.StatusInternalServerError)
		return
	}

	router.ServeHTTP(w, r)
}
