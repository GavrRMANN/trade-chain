package search

import (
	"context"
	"testing"

	"trade-chain/internal/domain"
	"trade-chain/internal/service"
)

// stubProductService отдаёт заранее описанный граф обмена.
//
// Поиск маршрута — чистый обход графа, и проверять его через базу значило бы
// проверять заодно SQL: соседей достаточно задать таблицей.
type stubProductService struct {
	service.ProductService
	neighbours map[string][]domain.Product
}

func (s stubProductService) GetExchangeCandidates(
	_ context.Context,
	productID string,
) ([]domain.Product, error) {
	return s.neighbours[productID], nil
}

func product(id string) domain.Product {
	return domain.Product{ProductID: id, Status: domain.ProductActive}
}

func ids(products []domain.Product) []string {
	out := make([]string, 0, len(products))
	for _, p := range products {
		out = append(out, p.ProductID)
	}
	return out
}

func equal(left, right []string) bool {
	if len(left) != len(right) {
		return false
	}
	for i := range left {
		if left[i] != right[i] {
			return false
		}
	}
	return true
}

// Обход идёт от цели к вещи пользователя: соседи берутся у цели, а найденный
// путь выходит целью вперёд. Порядок закреплён за обеими ручками поиска, и
// клиент разворачивает его у себя (см. orderChainForRoute на фронте), поэтому
// смена порядка здесь тихо перевернула бы страницу маршрута.
//
// Параметры объявлены как (target, source), где target — вещь, до которой
// идёт поиск: аргументы передаются позиционно, и FindChain вызывает функцию
// со своими (source, target).
func TestFindChainBFSReturnsPathFromTargetToSource(t *testing.T) {
	stub := stubProductService{neighbours: map[string][]domain.Product{
		"goal":   {product("middle")},
		"middle": {product("mine")},
	}}

	result, err := findChainBFS(
		context.Background(),
		stub,
		product("mine"),
		product("goal"),
		10,
	)
	if err != nil {
		t.Fatalf("неожиданная ошибка: %v", err)
	}
	if result == nil {
		t.Fatal("маршрут не найден, хотя путь существует")
	}

	want := []string{"goal", "middle", "mine"}
	if got := ids(result.Products); !equal(got, want) {
		t.Errorf("порядок маршрута: получено %v, ожидалось %v", got, want)
	}
	if result.Length != 2 {
		t.Errorf("число обменов: получено %d, ожидалось 2", result.Length)
	}
}

func TestFindChainBFSReturnsNilWhenNoPath(t *testing.T) {
	stub := stubProductService{neighbours: map[string][]domain.Product{
		"goal": {product("dead-end")},
	}}

	result, err := findChainBFS(
		context.Background(),
		stub,
		product("mine"),
		product("goal"),
		10,
	)
	if err != nil {
		t.Fatalf("неожиданная ошибка: %v", err)
	}
	if result != nil {
		t.Errorf("ожидался пустой результат, получено %v", ids(result.Products))
	}
}

// Глубина ограничивает длину маршрута, а не время обхода: цель за пределами
// лимита должна считаться недостижимой.
func TestFindChainBFSRespectsMaxDepth(t *testing.T) {
	stub := stubProductService{neighbours: map[string][]domain.Product{
		"goal":   {product("middle")},
		"middle": {product("mine")},
	}}

	result, err := findChainBFS(
		context.Background(),
		stub,
		product("mine"),
		product("goal"),
		1,
	)
	if err != nil {
		t.Fatalf("неожиданная ошибка: %v", err)
	}
	if result != nil {
		t.Errorf("маршрут глубже лимита не должен находиться, получено %v", ids(result.Products))
	}
}

// Ручка рекомендаций читается карточкой товара, которая разворачивает путь у
// себя: смена порядка здесь тихо сломала бы её.
func TestFindLegacyChainBFSKeepsTargetFirstOrder(t *testing.T) {
	stub := stubProductService{neighbours: map[string][]domain.Product{
		"target": {product("middle")},
		"middle": {product("mine")},
	}}

	result, err := findLegacyChainBFS(
		context.Background(),
		stub,
		product("target"),
		[]domain.Product{product("mine")},
		10,
	)
	if err != nil {
		t.Fatalf("неожиданная ошибка: %v", err)
	}
	if result == nil {
		t.Fatal("маршрут не найден, хотя путь существует")
	}

	want := []string{"target", "middle", "mine"}
	if got := ids(result.Products); !equal(got, want) {
		t.Errorf("порядок маршрута: получено %v, ожидалось %v", got, want)
	}
}
