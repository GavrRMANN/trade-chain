package service

import (
	"context"
	"trade-chain/internal/domain"
	"trade-chain/internal/repository"
)

type chainService struct {
	repo     repository.ChainRepository
	products repository.ProductRepository
}

func NewChainService(repo repository.ChainRepository, products repository.ProductRepository) ChainService {
	return &chainService{repo: repo, products: products}
}
func (s *chainService) Create(ctx context.Context, c *domain.Chain) (*domain.Chain, error) {
	if c == nil || blank(c.FromProductID) || blank(c.ToProductID) || c.FromProductID == c.ToProductID {
		return nil, ErrInvalidInput
	}
	if _, e := s.products.GetByID(ctx, c.FromProductID); e != nil {
		return nil, normalizeError(e)
	}
	if _, e := s.products.GetByID(ctx, c.ToProductID); e != nil {
		return nil, normalizeError(e)
	}
	if c.Status == "" {
		c.Status = string(domain.ChainPending)
	}
	if !validChainStatus(domain.ChainStatus(c.Status)) {
		return nil, ErrInvalidInput
	}
	v, e := s.repo.Create(ctx, c)
	return v, normalizeError(e)
}
func validChainStatus(v domain.ChainStatus) bool {
	switch v {
	case domain.ChainPending, domain.ChainActive, domain.ChainCompleted, domain.ChainCancelled:
		return true
	}
	return false
}
func (s *chainService) GetByID(ctx context.Context, id string) (*domain.Chain, error) {
	if blank(id) {
		return nil, ErrInvalidInput
	}
	v, e := s.repo.GetByID(ctx, id)
	return v, normalizeError(e)
}
func (s *chainService) GetByProductID(ctx context.Context, id string) ([]domain.Chain, error) {
	if blank(id) {
		return nil, ErrInvalidInput
	}
	v, e := s.repo.GetByProductID(ctx, id)
	return v, normalizeError(e)
}
func (s *chainService) GetFullChain(ctx context.Context, id string) ([]domain.Chain, error) {
	if blank(id) {
		return nil, ErrInvalidInput
	}
	v, e := s.repo.GetFullChain(ctx, id)
	return v, normalizeError(e)
}
func (s *chainService) UpdateStatus(ctx context.Context, id string, status domain.ChainStatus) error {
	if blank(id) || !validChainStatus(status) {
		return ErrInvalidInput
	}
	return normalizeError(s.repo.UpdateStatus(ctx, id, status))
}
func (s *chainService) Delete(ctx context.Context, id string) error {
	if blank(id) {
		return ErrInvalidInput
	}
	return normalizeError(s.repo.Delete(ctx, id))
}
