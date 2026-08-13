package httpapi

import (
	"context"
	"encoding/json"
	"net/http"
	"testing"

	"trade-chain/internal/auth"
	"trade-chain/internal/domain"
	"trade-chain/internal/search"
	"trade-chain/internal/service"
)

// fakeProductService — минимальный ProductService для поиска цепочки.
// Каталог и граф обмена задаются полями, остальные методы не участвуют.
type fakeProductService struct {
	byID       map[string]domain.Product
	byOwner    map[string][]domain.Product
	candidates map[string][]domain.Product
	listResult []domain.Product
	listErr    error

	lastListCustomer *string
	lastListQuery    string
}

func (f *fakeProductService) Create(context.Context, *domain.CreateProductDTO) (*domain.Product, error) {
	return nil, nil
}

func (f *fakeProductService) GetByID(_ context.Context, id string) (*domain.Product, error) {
	p, ok := f.byID[id]
	if !ok {
		return nil, service.ErrNotFound
	}
	return &p, nil
}

func (f *fakeProductService) GetByCustomerID(_ context.Context, customerID string) ([]domain.Product, error) {
	return f.byOwner[customerID], nil
}

func (f *fakeProductService) GetOwnByCustomerID(_ context.Context, customerID string) ([]domain.Product, error) {
	return f.byOwner[customerID], nil
}

func (f *fakeProductService) Update(context.Context, string, *domain.UpdateProductDTO) (*domain.Product, error) {
	return nil, nil
}

func (f *fakeProductService) Delete(context.Context, string, string) error { return nil }

func (f *fakeProductService) List(_ context.Context, customerID *string, q string, _ *string, _ int, _ int) ([]domain.Product, error) {
	f.lastListCustomer = customerID
	f.lastListQuery = q
	return f.listResult, f.listErr
}

func (f *fakeProductService) GetExchangeCandidates(_ context.Context, productID string) ([]domain.Product, error) {
	return f.candidates[productID], nil
}

func newSearchServer(t *testing.T, products *fakeProductService) (http.Handler, string) {
	t.Helper()
	svc := search.NewSearchService(products, nil)
	token, err := auth.GenerateToken(testUserID)
	if err != nil {
		t.Fatalf("не удалось выписать токен: %v", err)
	}
	return NewRouter(Dependencies{Search: svc}), token
}

func TestSearchChainRequiresToken(t *testing.T) {
	handler, _ := newSearchServer(t, &fakeProductService{})

	rec := do(t, handler, http.MethodGet, "/api/v1/search/chain?target_product_id=p-1", "", "")
	if rec.Code != http.StatusUnauthorized {
		t.Errorf("код %d, ожидался 401", rec.Code)
	}
}

func TestSearchChainValidatesInput(t *testing.T) {
	handler, token := newSearchServer(t, &fakeProductService{})

	cases := map[string]string{
		"без target_product_id": "/api/v1/search/chain",
		"max_depth=0":           "/api/v1/search/chain?target_product_id=p-1&max_depth=0",
		"max_depth не число":    "/api/v1/search/chain?target_product_id=p-1&max_depth=abc",
	}

	for name, path := range cases {
		t.Run(name, func(t *testing.T) {
			if rec := do(t, handler, http.MethodGet, path, token, ""); rec.Code != http.StatusBadRequest {
				t.Errorf("код %d, ожидался 400", rec.Code)
			}
		})
	}
}

// Регрессия: BFS без найденного пути возвращает (nil, nil). Хендлер обязан
// отдать пустую цепочку и 200, а не разыменовывать nil и падать в 500.
func TestSearchChainReturnsEmptyWhenNoPath(t *testing.T) {
	target := domain.Product{ProductID: "target", CustomerID: "someone-else"}
	products := &fakeProductService{
		byID:       map[string]domain.Product{"target": target},
		byOwner:    map[string][]domain.Product{testUserID: {{ProductID: "mine"}}},
		candidates: map[string][]domain.Product{}, // соседей нет — пути не будет
	}
	handler, token := newSearchServer(t, products)

	rec := do(t, handler, http.MethodGet, "/api/v1/search/chain?target_product_id=target", token, "")
	if rec.Code != http.StatusOK {
		t.Fatalf("код %d, ожидался 200: %s", rec.Code, rec.Body.String())
	}

	var out ChainSearchResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
		t.Fatalf("ответ не разобрался: %v", err)
	}
	if out.Chain == nil {
		t.Error("chain должен быть пустым массивом, а не null")
	}
	if len(out.Chain) != 0 || out.Length != 0 {
		t.Errorf("ожидалась пустая цепочка, получено %+v", out)
	}
}

func TestSearchChainReturnsFoundPath(t *testing.T) {
	target := domain.Product{ProductID: "target", CustomerID: "seller"}
	mine := domain.Product{ProductID: "mine", CustomerID: testUserID}
	products := &fakeProductService{
		byID:    map[string]domain.Product{"target": target},
		byOwner: map[string][]domain.Product{testUserID: {mine}},
		// От цели можно дойти до моего товара за один шаг.
		candidates: map[string][]domain.Product{"target": {mine}},
	}
	handler, token := newSearchServer(t, products)

	rec := do(t, handler, http.MethodGet, "/api/v1/search/chain?target_product_id=target&max_depth=5", token, "")
	if rec.Code != http.StatusOK {
		t.Fatalf("код %d, ожидался 200: %s", rec.Code, rec.Body.String())
	}

	var out ChainSearchResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
		t.Fatalf("ответ не разобрался: %v", err)
	}
	if len(out.Chain) != 2 || out.Length != 1 {
		t.Errorf("ожидалась цепочка из двух звеньев длиной 1, получено %+v", out)
	}
	if out.Chain[0].ProductID != "target" || out.Chain[1].ProductID != "mine" {
		t.Errorf("порядок звеньев нарушен: %+v", out.Chain)
	}
}

// Подборка следующего шага маршрута читает эту ручку с direct=true: в ряду
// «Следующий обмен» должны стоять только вещи, до которых от текущего товара
// есть прямой путь. Добор каталогом подставлял туда случайные товары, обмен с
// которыми никуда не ведёт.
func TestSearchCandidatesDirectSkipsCatalogFallback(t *testing.T) {
	source := domain.Product{ProductID: "mine", CustomerID: testUserID, Status: domain.ProductActive}
	wanted := domain.Product{ProductID: "wanted", CustomerID: "seller", Status: domain.ProductActive}
	stranger := domain.Product{ProductID: "stranger", CustomerID: "someone", Status: domain.ProductActive}
	products := &fakeProductService{
		byID:       map[string]domain.Product{"mine": source},
		candidates: map[string][]domain.Product{"mine": {wanted}},
		listResult: []domain.Product{stranger},
	}
	handler, token := newSearchServer(t, products)

	rec := do(t, handler, http.MethodGet, "/api/v1/search/candidates?product_id=mine&direct=true", token, "")
	if rec.Code != http.StatusOK {
		t.Fatalf("код %d, ожидался 200: %s", rec.Code, rec.Body.String())
	}

	var out CandidatesResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
		t.Fatalf("ответ не разобрался: %v", err)
	}
	if len(out.Products) != 1 || out.Products[0].ProductID != "wanted" {
		t.Errorf("ожидался только прямой кандидат, получено %+v", out.Products)
	}
}

// Без direct ручка остаётся прежней: не хватило совпадений по вишлисту —
// добираем каталогом.
func TestSearchCandidatesFallsBackToCatalogByDefault(t *testing.T) {
	source := domain.Product{ProductID: "mine", CustomerID: testUserID, Status: domain.ProductActive}
	stranger := domain.Product{ProductID: "stranger", CustomerID: "someone", Status: domain.ProductActive}
	products := &fakeProductService{
		byID:       map[string]domain.Product{"mine": source},
		candidates: map[string][]domain.Product{},
		listResult: []domain.Product{stranger},
	}
	handler, token := newSearchServer(t, products)

	rec := do(t, handler, http.MethodGet, "/api/v1/search/candidates?product_id=mine", token, "")
	if rec.Code != http.StatusOK {
		t.Fatalf("код %d, ожидался 200: %s", rec.Code, rec.Body.String())
	}

	var out CandidatesResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
		t.Fatalf("ответ не разобрался: %v", err)
	}
	if len(out.Products) != 1 || out.Products[0].ProductID != "stranger" {
		t.Errorf("ожидался добор каталогом, получено %+v", out.Products)
	}
}

func TestSearchCandidatesValidatesDirectFlag(t *testing.T) {
	handler, token := newSearchServer(t, &fakeProductService{})

	rec := do(t, handler, http.MethodGet, "/api/v1/search/candidates?product_id=mine&direct=maybe", token, "")
	if rec.Code != http.StatusBadRequest {
		t.Errorf("код %d, ожидался 400", rec.Code)
	}
}

func TestProductSearchRequiresQuery(t *testing.T) {
	handler := NewRouter(Dependencies{Products: &fakeProductService{}})

	if rec := do(t, handler, http.MethodGet, "/api/v1/products/search", "", ""); rec.Code != http.StatusBadRequest {
		t.Errorf("код %d, ожидался 400 без q", rec.Code)
	}
}

func TestProductSearchListsByQuery(t *testing.T) {
	products := &fakeProductService{
		listResult: []domain.Product{{ProductID: "p-1", Title: "iPhone 15"}},
	}
	handler := NewRouter(Dependencies{Products: products})

	rec := do(t, handler, http.MethodGet, "/api/v1/products/search?q=iPhone", "", "")
	if rec.Code != http.StatusOK {
		t.Fatalf("код %d, ожидался 200: %s", rec.Code, rec.Body.String())
	}
	if products.lastListQuery != "iPhone" {
		t.Errorf("в сервис ушёл запрос %q, ожидался iPhone", products.lastListQuery)
	}
	// Публичный поиск не должен фильтровать по владельцу.
	if products.lastListCustomer != nil {
		t.Errorf("поиск не должен привязываться к пользователю, получен %v", *products.lastListCustomer)
	}

	var out []domain.Product
	if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
		t.Fatalf("ответ не разобрался: %v", err)
	}
	if len(out) != 1 || out[0].Title != "iPhone 15" {
		t.Errorf("неожиданный результат поиска: %+v", out)
	}
}
