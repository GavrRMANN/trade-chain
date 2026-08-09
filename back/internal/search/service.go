package search

import (
	"context"
	"fmt"
	"trade-chain/internal/domain"
	"trade-chain/internal/service"
)

type SearchService struct {
	productService  service.ProductService
	categoryService service.CategoryService
}

type ProductSearchResult struct {
	Products []domain.Product
	Length   int
}

type CategorySearchResult struct {
	Categories []domain.Category
	Length     int
}

func NewSearchService(
	productService service.ProductService,
	categoryService service.CategoryService) *SearchService {
	return &SearchService{
		productService:  productService,
		categoryService: categoryService,
	}
}

func (s *SearchService) FindChain(
	ctx context.Context,
	customerID string,
	targetProductID string,
	maxDepth int,
) (*ProductSearchResult, error) {

	target, err := s.productService.GetByID(ctx, targetProductID)
	if err != nil {
		return nil, err
	}

	myProducts, err := s.productService.GetByCustomerID(ctx, customerID)
	if err != nil {
		return nil, err
	}

	// Пустой список своих товаров — это не поломка сервера, а состояние
	// пользователя: меняться ему пока нечем. Голая errors.New доезжала до
	// writeError неузнанной и превращалась в 500.
	if len(myProducts) == 0 {
		return nil, fmt.Errorf("%w: у пользователя нет товаров для обмена", service.ErrInvalidInput)
	}

	return findChainBFS(
		ctx,
		s.productService,
		*target,
		myProducts,
		maxDepth,
	)
}
