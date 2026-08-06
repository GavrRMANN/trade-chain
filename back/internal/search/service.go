package search

import (
	"context"
	"errors"
	"trade-chain/internal/service"
)

type SearchService struct {
	productService service.ProductService
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
) (*ChainResult, error) {

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
