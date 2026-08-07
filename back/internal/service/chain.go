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
	if c == nil || blank(c.FromProductID) || blank(c.ToProductID) || blank(c.InitiatorID) {
		return nil, ErrInvalidInput
	}
	if c.FromProductID == c.ToProductID {
		return nil, ErrInvalidInput
	}
	// Проверяем, что инициатор владеет from_product
	fromProd, err := s.products.GetByID(ctx, c.FromProductID)
	if err != nil {
		return nil, normalizeError(err)
	}
	if fromProd.CustomerID != c.InitiatorID {
		return nil, ErrForbidden
	}
	// Проверяем, что to_product существует
	_, err = s.products.GetByID(ctx, c.ToProductID)
	if err != nil {
		return nil, normalizeError(err)
	}
	if c.Status == "" {
		c.Status = string(domain.ChainPending)
	}
	if !validChainStatus(domain.ChainStatus(c.Status)) {
		return nil, ErrInvalidInput
	}
	// Нельзя создавать уже завершённые или отклонённые
	if c.Status == string(domain.ChainCompleted) || c.Status == string(domain.ChainRejected) {
		return nil, ErrInvalidInput
	}
	v, err := s.repo.Create(ctx, c)
	return v, normalizeError(err)
}

func validChainStatus(v domain.ChainStatus) bool {
	switch v {
	case domain.ChainPending, domain.ChainActive, domain.ChainCompleted, domain.ChainCancelled, domain.ChainRejected:
		return true
	}
	return false
}

func (s *chainService) GetByID(ctx context.Context, id string) (*domain.Chain, error) {
	if blank(id) {
		return nil, ErrInvalidInput
	}
	v, err := s.repo.GetByID(ctx, id)
	return v, normalizeError(err)
}

func (s *chainService) GetByProductID(ctx context.Context, id string) ([]domain.Chain, error) {
	if blank(id) {
		return nil, ErrInvalidInput
	}
	v, err := s.repo.GetByProductID(ctx, id)
	return v, normalizeError(err)
}

func (s *chainService) GetFullChain(ctx context.Context, id string) ([]domain.Chain, error) {
	if blank(id) {
		return nil, ErrInvalidInput
	}
	v, err := s.repo.GetFullChain(ctx, id)
	return v, normalizeError(err)
}

// UpdateStatus обновляет статус цепочки с проверкой прав
func (s *chainService) UpdateStatus(ctx context.Context, id string, status domain.ChainStatus, userID string) error {
	if blank(id) || !validChainStatus(status) || blank(userID) {
		return ErrInvalidInput
	}

	chain, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return normalizeError(err)
	}

	// Проверяем права в зависимости от статуса
	switch status {
	case domain.ChainActive:
		// Принять может только владелец to_product
		if chain.Status != string(domain.ChainPending) {
			return ErrInvalidInput
		}
		prod, err := s.products.GetByID(ctx, chain.ToProductID)
		if err != nil {
			return normalizeError(err)
		}
		if prod.CustomerID != userID {
			return ErrForbidden
		}
	case domain.ChainCompleted:
		// Завершить может любой из участников (упрощённо)
		if chain.Status != string(domain.ChainActive) {
			return ErrInvalidInput
		}
		// Проверим, что userID является одним из владельцев
		fromProd, err := s.products.GetByID(ctx, chain.FromProductID)
		if err != nil {
			return normalizeError(err)
		}
		toProd, err := s.products.GetByID(ctx, chain.ToProductID)
		if err != nil {
			return normalizeError(err)
		}
		if fromProd.CustomerID != userID && toProd.CustomerID != userID {
			return ErrForbidden
		}
		// Выполняем обмен
		return s.repo.CompleteExchange(ctx, id)
	case domain.ChainCancelled, domain.ChainRejected:
		// Отменить или отклонить может инициатор или владелец to_product
		if chain.InitiatorID != userID {
			prod, err := s.products.GetByID(ctx, chain.ToProductID)
			if err != nil {
				return normalizeError(err)
			}
			if prod.CustomerID != userID {
				return ErrForbidden
			}
		}
		// Если статус уже завершён, нельзя менять
		if chain.Status == string(domain.ChainCompleted) {
			return ErrInvalidInput
		}
	default:
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
