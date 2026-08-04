package main

import (
	"fmt"
	"trade-chain/infrastructure/database"
)

func main() {
	connection, err := database.NewConnection()

	if err != nil {
		fmt.Printf("Fatal error: %s\n", err.Error())
	} else {
		fmt.Println("Successfull connection!")
	}
	connection.Close()
}
