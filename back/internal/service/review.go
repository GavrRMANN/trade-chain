package service

import (
	"context"
	"trade-chain/internal/domain"
	"trade-chain/internal/repository"
)

type reviewService struct {
	repo      repository.ReviewRepository
	customers repository.CustomerRepository
	products  repository.ProductRepository
}

func NewReviewService(r repository.ReviewRepository, c repository.CustomerRepository, p repository.ProductRepository) ReviewService {
	return &reviewService{r, c, p}
}
func (s *reviewService) Create(ctx context.Context, v *domain.Review) (*domain.Review, error) {
	if v == nil || blank(v.FromCustomerID) || blank(v.ToCustomerID) || v.FromCustomerID == v.ToCustomerID || v.Rating < 1 || v.Rating > 5 {
		return nil, ErrInvalidInput
	}
	if _, e := s.customers.GetByID(ctx, v.FromCustomerID); e != nil {
		return nil, normalizeError(e)
	}
	if _, e := s.customers.GetByID(ctx, v.ToCustomerID); e != nil {
		return nil, normalizeError(e)
	}
	if v.ProductID != nil {
		if _, e := s.products.GetByID(ctx, *v.ProductID); e != nil {
			return nil, normalizeError(e)
		}
	}
	out, e := s.repo.Create(ctx, v)
	return out, normalizeError(e)
}
func (s *reviewService) GetByID(ctx context.Context, id string) (*domain.Review, error) {
	if blank(id) {
		return nil, ErrInvalidInput
	}
	v, e := s.repo.GetByID(ctx, id)
	return v, normalizeError(e)
}
func (s *reviewService) GetByCustomerID(ctx context.Context, id string) ([]domain.Review, error) {
	if blank(id) {
		return nil, ErrInvalidInput
	}
	v, e := s.repo.GetByCustomerID(ctx, id)
	return v, normalizeError(e)
}
func (s *reviewService) GetAverageRating(ctx context.Context, id string) (float64, error) {
	if blank(id) {
		return 0, ErrInvalidInput
	}
	v, e := s.repo.GetAverageRating(ctx, id)
	return v, normalizeError(e)
}
func (s *reviewService) Delete(ctx context.Context, id string) error {
	if blank(id) {
		return ErrInvalidInput
	}
	return normalizeError(s.repo.Delete(ctx, id))
}
