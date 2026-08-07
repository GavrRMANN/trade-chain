package main

import (
	"context"
	"fmt"
	"log"
	"trade-chain/infrastructure/database"
)

func main() {
	connection, err := database.NewConnection()
	if err != nil {
		log.Fatalf("Fatal error: %s\n", err.Error())
	}
	defer connection.Close()

	fmt.Println("Successfull connection!")

	if err := connection.Pool.Ping(context.Background()); err != nil {
		log.Fatalf("Failed to ping database: %s\n", err.Error())
	}

	fmt.Println("Database connection verified successfully!")
}
