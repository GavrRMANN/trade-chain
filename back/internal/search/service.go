package search

import (
	"context"
	"errors"
	"trade-chain/internal/repository"
)

type SearchService struct {
	productRepo repository.ProductRepository
}

func NewSearchService(
	productRepo repository.ProductRepository) *SearchService {
	return &SearchService{
		productRepo: productRepo,
	}
}

func (s *SearchService) FindChain(
	ctx context.Context,
	customerID string,
	targetProductID string,
	maxDepth int,
) (*ChainResult, error) {

	target, err := s.productRepo.GetByID(ctx, targetProductID)
	if err != nil {
		return nil, err
	}

	myProducts, err := s.productRepo.GetByCustomerID(ctx, customerID)
	if err != nil {
		return nil, err
	}

	if len(myProducts) == 0 {
		return nil, errors.New("user has no products")
	}

	return findChainBFS(
		ctx,
		s.productRepo,
		*target,
		myProducts,
		maxDepth,
	)
}
