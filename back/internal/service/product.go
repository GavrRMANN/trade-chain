package service

import (
	"context"
	"strings"
	"trade-chain/internal/domain"
	"trade-chain/internal/repository"
)

type productService struct {
	repo      repository.ProductRepository
	customers repository.CustomerRepository
}

func NewProductService(repo repository.ProductRepository, customers repository.CustomerRepository) ProductService {
	return &productService{repo: repo, customers: customers}
}
func (s *productService) Create(ctx context.Context, dto *domain.CreateProductDTO) (*domain.Product, error) {
	if dto == nil || blank(dto.CustomerID) || blank(dto.Name) {
		return nil, ErrInvalidInput
	}
	if _, e := s.customers.GetByID(ctx, dto.CustomerID); e != nil {
		return nil, normalizeError(e)
	}
	copyDTO := *dto
	copyDTO.Name = strings.TrimSpace(copyDTO.Name)
	copyDTO.Description = strings.TrimSpace(copyDTO.Description)
	v, e := s.repo.Create(ctx, &copyDTO)
	return v, normalizeError(e)
}
func (s *productService) GetByID(ctx context.Context, id string) (*domain.Product, error) {
	if blank(id) {
		return nil, ErrInvalidInput
	}
	v, e := s.repo.GetByID(ctx, id)
	return v, normalizeError(e)
}
func (s *productService) GetByCustomerID(ctx context.Context, id string) ([]domain.Product, error) {
	if blank(id) {
		return nil, ErrInvalidInput
	}
	v, e := s.repo.GetByCustomerID(ctx, id)
	return v, normalizeError(e)
}
func (s *productService) Update(ctx context.Context, id string, dto *domain.UpdateProductDTO) (*domain.Product, error) {
	if blank(id) || dto == nil {
		return nil, ErrInvalidInput
	}
	if dto.Name != nil && blank(*dto.Name) {
		return nil, ErrInvalidInput
	}
	v, e := s.repo.Update(ctx, id, dto)
	return v, normalizeError(e)
}
func (s *productService) Delete(ctx context.Context, id string) error {
	if blank(id) {
		return ErrInvalidInput
	}
	return normalizeError(s.repo.Delete(ctx, id))
}
func (s *productService) List(ctx context.Context, offset, limit int) ([]domain.Product, error) {
	o, l, e := validatePage(offset, limit)
	if e != nil {
		return nil, e
	}
	v, e := s.repo.List(ctx, o, l)
	return v, normalizeError(e)
}
func (s *productService) Search(ctx context.Context, q string, categoryID *string) ([]domain.Product, error) {
	q = strings.TrimSpace(q)
	if q == "" && categoryID == nil {
		return nil, ErrInvalidInput
	}
	v, e := s.repo.Search(ctx, q, categoryID)
	return v, normalizeError(e)
}
func (s *productService) GetExchangeCandidates(ctx context.Context, productID string) ([]domain.Product, error) {
	if blank(productID) {
		return nil, ErrInvalidInput
	}
	return s.GetExchangeCandidates(ctx, productID)
}
