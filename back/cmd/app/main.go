package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"trade-chain/internal/httpapi"
	"trade-chain/internal/repository"
	"trade-chain/internal/search"
	"trade-chain/internal/service"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	ctx := context.Background()

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatal("failed to connect to database:", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatal("failed to ping database:", err)
	}

	// Репозитории
	customerRepo := repository.NewCustomerRepository(pool)
	productRepo := repository.NewProductRepository(pool)
	categoryRepo := repository.NewCategoryRepository(pool) // нужно создать, если нет
	wishlistRepo := repository.NewWishlistRepository(pool) // нужно создать
	chainRepo := repository.NewChainRepository(pool)
	negotiationRepo := repository.NewNegotiationRepository(pool)
	reviewRepo := repository.NewReviewRepository(pool)

	// Сервисы
	customerService := service.NewCustomerService(customerRepo)
	productService := service.NewProductService(productRepo, customerRepo)
	categoryService := service.NewCategoryService(categoryRepo)
	wishlistService := service.NewWishlistService(wishlistRepo, productRepo)
	chainService := service.NewChainService(chainRepo, productRepo, negotiationRepo)
	offerService := service.NewOfferService(chainService, chainRepo, negotiationRepo)
	reviewService := service.NewReviewService(reviewRepo, customerRepo, productRepo, chainService)

	// Сервис поиска
	searchService := search.NewSearchService(productService, categoryService)

	// HTTP роутер
	deps := httpapi.Dependencies{
		Customers:  customerService,
		Products:   productService,
		Chains:     chainService,
		Offers:     offerService,
		Reviews:    reviewService,
		Categories: categoryService,
		Wishlists:  wishlistService,
		Search:     searchService,
	}
	router := httpapi.NewRouter(deps)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("starting server on port %s", port)
	if err := http.ListenAndServe(":"+port, router); err != nil {
		log.Fatal(err)
	}
}
