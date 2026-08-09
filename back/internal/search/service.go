package search

import (
	"context"
	"errors"
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

	if len(myProducts) == 0 {
		return nil, errors.New("user has no products")
	}

	return findChainBFS(
		ctx,
		s.productService,
		*target,
		myProducts,
		maxDepth,
	)
}
