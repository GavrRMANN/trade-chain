package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"trade-chain/internal/repository"
	"trade-chain/internal/search"
	"trade-chain/internal/service"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	ctx := context.Background()

	dbURL := os.Getenv("DATABASE_URL")

	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/trade_chain?sslmode=disable"
	}

	db, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatal("database connection error:", err)
	}

	defer db.Close()

	if err := db.Ping(ctx); err != nil {
		log.Fatal("database ping error:", err)
	}

	fmt.Println("✅ Database connected")

	// Репозиторий
	prodRepo := repository.NewProductRepository(db)
	customerRepo := repository.NewCustomerRepository(db)
	prod := service.NewProductService(prodRepo, customerRepo)

	// Сервис поиска
	searchService := search.NewSearchService(prod)

	// Берём User1
	var customerID string

	err = db.QueryRow(
		ctx,
		`
		SELECT customer_id
		FROM customers
		WHERE email = 'user1@test.com'
		`,
	).Scan(&customerID)

	if err != nil {
		log.Fatal("cannot find user1:", err)
	}

	// Ищем RTX4080
	var targetProductID string

	err = db.QueryRow(
		ctx,
		`
		SELECT product_id
		FROM products
		WHERE name = 'RTX 4080'
		`,
	).Scan(&targetProductID)

	if err != nil {
		log.Fatal("cannot find target:", err)
	}

	fmt.Println("User1:", customerID)
	fmt.Println("Target:", targetProductID)

	result, err := searchService.FindChain(
		ctx,
		customerID,
		targetProductID,
		10,
	)

	if err != nil {
		log.Fatal("search error:", err)
	}

	if result == nil {
		fmt.Println("❌ Chain not found")
		return
	}

	fmt.Println("\n✅ Chain found")
	fmt.Println("====================")

	for i, product := range result.Products {
		fmt.Printf(
			"%d. %s\n",
			i+1,
			product.Name,
		)
	}

	fmt.Println("====================")
	fmt.Println("Length:", result.Length)

	fmt.Println("Выполняем поисковый запрос: ")
	fmt.Println("====================")
	result, err = searchService.FindProduct(ctx, "телефон")
	if err != nil {
		fmt.Println("Сбой при поиске товара ", err)
		return
	}
	fmt.Println("Ищу iphone, получаю: ")
	for _, value := range result.Products {
		fmt.Println(value.Name)
	}
}
