package service

import (
	"context"
	"strings"
	"time"
	"trade-chain/internal/domain"
	"trade-chain/internal/exchange"
	"trade-chain/internal/repository"
)

type chainService struct {
	repo         repository.ChainRepository
	products     repository.ProductRepository
	negotiations repository.NegotiationRepository
}

func NewChainService(
	repo repository.ChainRepository,
	products repository.ProductRepository,
	negotiations repository.NegotiationRepository,
) ChainService {
	return &chainService{repo: repo, products: products, negotiations: negotiations}
}

// dealOf собирает взгляд на звено, с которым работают правила согласования.
//
// Стороны берутся из самого звена, а не из текущих владельцев товаров:
// успешный обмен меняет владельцев местами, и вычисление на лету после
// завершения сделки указывало бы обеими сторонами на одного человека.
func (s *chainService) dealOf(chain *domain.Chain) exchange.Deal {
	return exchange.Deal{
		ChainID:     chain.ChainID,
		InitiatorID: chain.InitiatorID,
		RecipientID: chain.RecipientID,
		Status:      domain.ChainStatus(chain.Status),
		ExpiresAt:   chain.ExpiresAt,
	}
}

func (s *chainService) Create(ctx context.Context, c *domain.Chain) (*domain.Chain, error) {
	if c == nil || blank(c.FromProductID) || blank(c.ToProductID) || blank(c.InitiatorID) {
		return nil, ErrInvalidInput
	}

	offered, err := s.products.GetByID(ctx, c.FromProductID)
	if err != nil {
		return nil, normalizeError(err)
	}
	requested, err := s.products.GetByID(ctx, c.ToProductID)
	if err != nil {
		return nil, normalizeError(err)
	}

	deal := exchange.Deal{
		ChainID:     c.ChainID,
		InitiatorID: c.InitiatorID,
		RecipientID: requested.CustomerID,
	}
	if err := exchange.Validate(deal, *offered, *requested); err != nil {
		return nil, mapExchangeError(err)
	}

	// Новое предложение всегда начинается с ожидания ответа: создать сразу
	// принятым или завершённым нельзя, иначе согласие второй стороны
	// становится необязательным.
	c.Status = string(domain.ChainPending)
	c.RecipientID = requested.CustomerID
	if c.ExpiresAt.IsZero() {
		c.ExpiresAt = time.Now().Add(exchange.DefaultTTL)
	}

	v, err := s.repo.Create(ctx, c)
	return v, normalizeError(err)
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

func (s *chainService) GetByCustomerID(ctx context.Context, customerID string) ([]domain.Chain, error) {
	if blank(customerID) {
		return nil, ErrInvalidInput
	}
	v, err := s.repo.GetByCustomerID(ctx, customerID)
	return v, normalizeError(err)
}

func (s *chainService) GetFullChain(ctx context.Context, id string) ([]domain.Chain, error) {
	if blank(id) {
		return nil, ErrInvalidInput
	}
	v, err := s.repo.GetFullChain(ctx, id)
	return v, normalizeError(err)
}

// statusActions переводит запрошенный статус в действие стейт-машины.
//
// completed сюда не входит намеренно: обмен считается состоявшимся только
// после подтверждения обеими сторонами, и путь к нему один — через Confirm.
var statusActions = map[domain.ChainStatus]exchange.Action{
	domain.ChainActive:    exchange.ActionAccept,
	domain.ChainRejected:  exchange.ActionDecline,
	domain.ChainCountered: exchange.ActionCounter,
	domain.ChainCancelled: exchange.ActionCancel,
}

// UpdateStatus оставлен ради существующей ручки PATCH /chains/{id}/status:
// фронт присылает желаемый статус, а решение принимает стейт-машина.
func (s *chainService) UpdateStatus(ctx context.Context, id string, status domain.ChainStatus, userID string) error {
	action, ok := statusActions[status]
	if !ok {
		return ErrInvalidInput
	}
	_, err := s.Decide(ctx, id, action, userID)
	return err
}

// Decide применяет к звену действие одной из сторон.
func (s *chainService) Decide(ctx context.Context, id string, action exchange.Action, actorID string) (*domain.Chain, error) {
	if blank(id) || blank(actorID) {
		return nil, ErrInvalidInput
	}

	chain, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, normalizeError(err)
	}
	deal := s.dealOf(chain)

	next, err := exchange.Apply(deal, action, actorID, time.Now())
	if err != nil {
		return nil, mapExchangeError(err)
	}
	if err := s.repo.UpdateStatus(ctx, id, next); err != nil {
		return nil, normalizeError(err)
	}

	updated, err := s.repo.GetByID(ctx, id)
	return updated, normalizeError(err)
}

// Confirm записывает решение стороны об итоге обмена и, если высказались оба,
// закрывает сделку.
//
// Подтверждения перечитываются из базы после записи своего: две стороны могут
// нажать кнопку одновременно, и решение по локальному списку оставило бы обмен
// незавершённым, хотя согласились оба.
func (s *chainService) Confirm(ctx context.Context, id, actorID string, success bool) (*domain.Chain, error) {
	if blank(id) || blank(actorID) {
		return nil, ErrInvalidInput
	}

	chain, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, normalizeError(err)
	}
	deal := s.dealOf(chain)

	existing, err := s.negotiations.ListConfirmations(ctx, id)
	if err != nil {
		return nil, normalizeError(err)
	}
	if err := exchange.CanConfirm(deal, actorID, existing); err != nil {
		return nil, mapExchangeError(err)
	}

	err = s.negotiations.Confirm(ctx, &domain.ChainConfirmation{
		ChainID:    id,
		CustomerID: actorID,
		Success:    success,
	})
	if err != nil {
		return nil, normalizeError(err)
	}

	all, err := s.negotiations.ListConfirmations(ctx, id)
	if err != nil {
		return nil, normalizeError(err)
	}

	if status, settled := exchange.Resolve(deal, all); settled {
		if err := s.settle(ctx, id, status); err != nil {
			return nil, err
		}
	}

	updated, err := s.repo.GetByID(ctx, id)
	return updated, normalizeError(err)
}

// settle закрывает звено итоговым статусом.
//
// Успешный обмен идёт через CompleteExchange: он в одной транзакции меняет
// владельцев товаров, поэтому вещи не могут разъехаться со статусом сделки.
func (s *chainService) settle(ctx context.Context, id string, status domain.ChainStatus) error {
	if status != domain.ChainCompleted {
		return normalizeError(s.repo.UpdateStatus(ctx, id, status))
	}

	if err := s.repo.CompleteExchange(ctx, id); err != nil {
		// Обе стороны могли подтвердить одновременно: тот, кто пришёл вторым,
		// увидит звено уже завершённым, и это не ошибка.
		chain, getErr := s.repo.GetByID(ctx, id)
		if getErr == nil && chain.Status == string(domain.ChainCompleted) {
			return nil
		}
		return normalizeError(err)
	}
	return nil
}

// Messages отдаёт переписку по звену. Читать её может только участник:
// договорённости о встрече — не публичная часть объявления.
func (s *chainService) Messages(ctx context.Context, id, actorID string) ([]domain.ChainMessage, error) {
	if blank(id) || blank(actorID) {
		return nil, ErrInvalidInput
	}

	chain, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, normalizeError(err)
	}
	deal := s.dealOf(chain)
	if !deal.Involves(actorID) {
		return nil, mapExchangeError(domain.ErrNotParticipant)
	}

	v, err := s.negotiations.ListMessages(ctx, id)
	return v, normalizeError(err)
}

func (s *chainService) SendMessage(ctx context.Context, id, actorID, body string) (*domain.ChainMessage, error) {
	body = strings.TrimSpace(body)
	if blank(id) || blank(actorID) || body == "" {
		return nil, ErrInvalidInput
	}

	chain, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, normalizeError(err)
	}
	deal := s.dealOf(chain)
	if err := exchange.CanWrite(deal, actorID); err != nil {
		return nil, mapExchangeError(err)
	}

	v, err := s.negotiations.AddMessage(ctx, &domain.ChainMessage{
		ChainID:    id,
		CustomerID: actorID,
		Body:       body,
	})
	return v, normalizeError(err)
}

// CanReview сообщает, вправе ли пользователь оценить вторую сторону, и кого
// именно он оценивает. Нужен сервису отзывов, чтобы оценка опиралась
// на состоявшийся обмен, а не на желание поставить звёзды.
func (s *chainService) CanReview(ctx context.Context, id, actorID string) (string, error) {
	if blank(id) || blank(actorID) {
		return "", ErrInvalidInput
	}

	chain, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return "", normalizeError(err)
	}
	deal := s.dealOf(chain)
	if err := exchange.CanReview(deal, actorID); err != nil {
		return "", mapExchangeError(err)
	}
	return deal.Counterparty(actorID), nil
}

func (s *chainService) Delete(ctx context.Context, id string) error {
	if blank(id) {
		return ErrInvalidInput
	}
	return normalizeError(s.repo.Delete(ctx, id))
}

func (s *chainService) ListOffers(ctx context.Context, userID string, role, status string) ([]domain.Chain, error) {
	if blank(userID) {
		return nil, ErrInvalidInput
	}
	chains, err := s.repo.GetByCustomerID(ctx, userID)
	if err != nil {
		return nil, normalizeError(err)
	}
	// Фильтрация на уровне памяти (можно перенести в SQL при необходимости)
	var filtered []domain.Chain
	for _, c := range chains {
		if status != "" && c.Status != status {
			continue
		}
		switch role {
		case "incoming":
			if c.RecipientID != userID {
				continue
			}
		case "outgoing":
			if c.InitiatorID != userID {
				continue
			}
			// если role не указана, показываем все
		}
		filtered = append(filtered, c)
	}
	return filtered, nil
}

// CreateOffer создаёт новое предложение (обёртка над Create с дополнительными полями).
func (s *chainService) CreateOffer(ctx context.Context, offeredProductID, requestedProductID, initiatorID string,
	goalID, stepID *string, surcharge *domain.Surcharge, comment string) (*domain.Chain, error) {

	// Сначала создаём цепочку
	c := &domain.Chain{
		FromProductID:  offeredProductID,
		ToProductID:    requestedProductID,
		InitiatorID:    initiatorID,
		ExchangeGoalID: goalID,
		RouteStepID:    stepID,
		Surcharge:      surcharge,
		Message:        comment,
	}
	created, err := s.Create(ctx, c)
	if err != nil {
		return nil, err
	}
	// Если есть комментарий, отправляем его как первое сообщение в чат
	if comment != "" {
		_, err = s.SendMessage(ctx, created.ChainID, initiatorID, comment)
		if err != nil {
			// Не фатально, но логируем
			// Можно вернуть созданное предложение, сообщение сохранится позже
		}
	}
	return created, nil
}

// CancelOffer отзывает предложение (Decide с ActionCancel).
func (s *chainService) CancelOffer(ctx context.Context, chainID, actorID string) (*domain.Chain, error) {
	return s.Decide(ctx, chainID, exchange.ActionCancel, actorID)
}

// AcceptOffer принимает предложение (Decide с ActionAccept).
func (s *chainService) AcceptOffer(ctx context.Context, chainID, actorID string) (*domain.Chain, error) {
	return s.Decide(ctx, chainID, exchange.ActionAccept, actorID)
}

// DeclineOffer отклоняет предложение (Decide с ActionDecline).
func (s *chainService) DeclineOffer(ctx context.Context, chainID, actorID string) (*domain.Chain, error) {
	return s.Decide(ctx, chainID, exchange.ActionDecline, actorID)
}
