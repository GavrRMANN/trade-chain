package main

import (
	"fmt"
	"time"

	"trade-chain/internal/domain"
	"trade-chain/internal/search"
)

func product(
	id string,
	name string,
	user string,
) domain.Product {

	category := "electronics"

	return domain.Product{
		ProductID:  id,
		CustomerID: user,
		CategoryID: &category,
		Name:       name,
		IsActive:   true,
		CreatedAt:  time.Now(),
	}
}

func main() {

	// Товары из действенной цепочки

	rtx := product(
		"rtx",
		"RTX 4090",
		"user10",
	)

	ps5 := product(
		"ps5",
		"PlayStation 5",
		"user9",
	)

	console := product(
		"console",
		"Xbox Series X",
		"user8",
	)

	bike := product(
		"bike",
		"Mountain Bike",
		"user7",
	)

	watch := product(
		"watch",
		"Apple Watch",
		"user6",
	)

	phone := product(
		"phone",
		"iPhone",
		"user1",
	)

	// Вторая цепочка

	macbook := product(
		"macbook",
		"MacBook",
		"user20",
	)

	laptop := product(
		"laptop",
		"Gaming Laptop",
		"user19",
	)

	drone := product(
		"drone",
		"Drone",
		"user18",
	)

	camera := product(
		"camera",
		"Camera",
		"user17",
	)

	// Мусорные товары

	tv := product(
		"tv",
		"TV",
		"user30",
	)

	printer := product(
		"printer",
		"Printer",
		"user31",
	)

	// ==========================
	// Создаём граф
	// ==========================

	graph := search.NewReverseGraph()

	graph.AddEdge(phone, watch)

	graph.AddEdge(watch, bike)

	graph.AddEdge(bike, console)

	graph.AddEdge(console, ps5)

	graph.AddEdge(ps5, rtx)

	// Цепочка 2:
	//
	// Camera
	//  |
	// Drone
	//  |
	// Laptop
	//  |
	// MacBook
	//  |
	// RTX

	graph.AddEdge(camera, drone)

	graph.AddEdge(drone, laptop)

	graph.AddEdge(laptop, macbook)

	graph.AddEdge(macbook, rtx)

	// Ложная ветка

	graph.AddEdge(
		tv,
		printer,
	)

	graph.AddEdge(
		printer,
		rtx,
	)

	// ==========================
	// Тест 1
	// Пользователь имеет Phone
	// ==========================

	fmt.Println("====== TEST 1 ======")

	result := search.FindChain(
		graph,
		rtx,
		[]domain.Product{
			phone,
		},
		10,
	)

	if result == nil {

		fmt.Println(
			"Цепочка не найдена",
		)

	} else {

		for _, p := range result.Products {

			fmt.Println(
				p.Name,
			)
		}

		fmt.Println(
			"Длина:",
			result.Length,
		)
	}

	// ==========================
	// Тест 2
	// У пользователя нет нужного товара
	// ==========================

	fmt.Println()
	fmt.Println("====== TEST 2 ======")

	result = search.FindChain(
		graph,
		rtx,
		[]domain.Product{
			laptop,
		},
		10,
	)

	if result == nil {

		fmt.Println(
			"Цепочка отсутствует",
		)

	} else {

		for _, p := range result.Products {

			fmt.Println(
				p.Name,
			)
		}

		fmt.Println(
			"Длина:",
			result.Length,
		)
	}

}
