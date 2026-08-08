package domain

import (
	"errors"
	"time"
)

type Chain struct {
	ChainID         string     `json:"chain_id"`
	FromProductID   string     `json:"from_product_id"`
	ToProductID     string     `json:"to_product_id"`
	InitiatorID     string     `json:"initiator_id"`
	RecipientID     string     `json:"recipient_id"`
	PreviousChainID *string    `json:"previous_chain_id,omitempty"`
	NextChainID     *string    `json:"next_chain_id,omitempty"`
	Status          string     `json:"status"`
	Message         string     `json:"message,omitempty"`
	ExpiresAt       time.Time  `json:"expires_at"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
	ExchangeGoalID  *string    `json:"exchange_goal_id,omitempty"`
	RouteStepID     *string    `json:"route_step_id,omitempty"`
	Surcharge       *Surcharge `json:"surcharge,omitempty"`
}

// ChainStatus — состояние звена обмена.
//
// Разделение completed и failed принципиально: только completed переводит
// товары в статус «обменяно» и открывает возможность оставить отзыв.
// Несостоявшаяся встреча даёт право на жалобу, но не на оценку — иначе отказ
// от сделки превращается в инструмент давления на вторую сторону.
type ChainStatus string

const (
	ChainPending   ChainStatus = "pending"   // предложение отправлено, ответа нет
	ChainActive    ChainStatus = "active"    // получатель согласился, стороны договариваются
	ChainCompleted ChainStatus = "completed" // обмен состоялся, подтвердили оба
	ChainCancelled ChainStatus = "cancelled" // инициатор отозвал предложение
	ChainRejected  ChainStatus = "rejected"  // получатель отказался
	ChainCountered ChainStatus = "countered" // получатель предложил свой вариант
	ChainFailed    ChainStatus = "failed"    // договорились, но обмен не состоялся
	ChainExpired   ChainStatus = "expired"   // ответа не дождались
)

// IsFinal сообщает, что звено больше не изменится.
func (s ChainStatus) IsFinal() bool {
	switch s {
	case ChainCompleted, ChainCancelled, ChainRejected, ChainCountered, ChainFailed, ChainExpired:
		return true
	default:
		return false
	}
}

// ChainMessage — реплика в переписке по конкретному звену.
//
// Чат привязан к сделке, а не к паре пользователей: обсуждение всегда имеет
// предмет, и обе стороны видят, о каком именно обмене идёт речь.
type ChainMessage struct {
	MessageID  string    `json:"message_id"`
	ChainID    string    `json:"chain_id"`
	CustomerID string    `json:"customer_id"`
	Body       string    `json:"body"`
	CreatedAt  time.Time `json:"created_at"`
}

// ChainConfirmation — подтверждение итога обмена одной из сторон.
type ChainConfirmation struct {
	ChainID    string    `json:"chain_id"`
	CustomerID string    `json:"customer_id"`
	Success    bool      `json:"success"`
	CreatedAt  time.Time `json:"created_at"`
}

type Surcharge struct {
	Amount   int     `json:"amount"`
	Currency string  `json:"currency"`
	Payer    *string `json:"payer,omitempty"` // "initiator" или "recipient", nil — нет
}

// Ошибки бизнес-правил обмена. Транспортный слой переводит их в коды ответа
// через сервисные ошибки, поэтому текст здесь пишется для человека.
var (
	ErrNotParticipant     = errors.New("пользователь не участвует в этом обмене")
	ErrWrongActor         = errors.New("это действие доступно другой стороне")
	ErrChainFinal         = errors.New("обмен уже завершён")
	ErrInvalidTransition  = errors.New("действие недоступно в текущем статусе")
	ErrSelfExchange       = errors.New("нельзя обменяться с самим собой")
	ErrProductUnavailable = errors.New("товар недоступен для обмена")
	ErrAlreadyConfirmed   = errors.New("итог обмена уже подтверждён")
)
