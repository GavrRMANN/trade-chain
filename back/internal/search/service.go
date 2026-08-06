package search

import (
	"context"
	"errors"
	"trade-chain/internal/domain"
	"trade-chain/internal/service"
)

type SearchService struct {
	productService service.ProductService
}

type SearchResult struct {
	Products []domain.Product
	Length   int
}

func NewSearchService(
	productService service.ProductService) *SearchService {
	return &SearchService{
		productService: productService,
	}
}

func (s *SearchService) FindChain(
	ctx context.Context,
	customerID string,
	targetProductID string,
	maxDepth int,
) (*SearchResult, error) {

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

func (s *SearchService) FindProduct(
	ctx context.Context,
	searchQuery string,
) (*SearchResult, error) {
	target, err := s.productService.Search(ctx, searchQuery, nil)

	if err != nil {
		return nil, err
	}

	return &SearchResult{
		Products: target,
		Length:   len(target),
	}, nil

}
