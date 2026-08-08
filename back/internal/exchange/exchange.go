// Package exchange содержит правила согласования обмена: кто и когда может
// изменить статус звена и как из подтверждений сторон получается итог.
//
// Правила вынесены в чистые функции без базы и без HTTP намеренно: именно
// здесь решается, потеряет ли человек контроль над своей вещью, поэтому
// логика должна проверяться в отрыве от инфраструктуры.
package exchange

import (
	"time"

	"trade-chain/internal/domain"
)

// Action — действие над звеном обмена.
type Action string

const (
	ActionAccept  Action = "accept"
	ActionDecline Action = "decline"
	ActionCounter Action = "counter"
	ActionCancel  Action = "cancel"
	ActionExpire  Action = "expire"
)

// DefaultTTL — срок жизни предложения. Ограничение существует ради того, кто
// ждёт ответа: висящее неделями предложение занимает внимание, а не вещь.
const DefaultTTL = 72 * time.Hour

// Deal — взгляд на звено глазами правил согласования.
//
// В таблице chains хранятся товары, а не люди, поэтому владельцев подставляет
// вызывающий слой: он и так читает оба товара, чтобы проверить их доступность.
type Deal struct {
	ChainID     string
	InitiatorID string // предложил обмен, владелец from_product
	RecipientID string // владелец to_product, ему решать
	Status      domain.ChainStatus
	ExpiresAt   time.Time
}

// Involves сообщает, участвует ли пользователь в этом обмене.
func (d Deal) Involves(customerID string) bool {
	return customerID != "" && (d.InitiatorID == customerID || d.RecipientID == customerID)
}

// Counterparty возвращает вторую сторону обмена.
func (d Deal) Counterparty(customerID string) string {
	if d.InitiatorID == customerID {
		return d.RecipientID
	}
	return d.InitiatorID
}

// actorRole описывает, кому доступно действие.
type actorRole int

const (
	roleRecipient actorRole = iota // владелец запрошенного товара
	roleInitiator                  // тот, кто предложил обмен
	roleSystem                     // само приложение, по времени
)

// rule описывает один допустимый переход стейт-машины.
type rule struct {
	from  domain.ChainStatus
	actor actorRole
	to    domain.ChainStatus
}

// transitions — полная таблица переходов. Всё, чего здесь нет, запрещено.
var transitions = map[Action]rule{
	ActionAccept:  {from: domain.ChainPending, actor: roleRecipient, to: domain.ChainActive},
	ActionDecline: {from: domain.ChainPending, actor: roleRecipient, to: domain.ChainRejected},
	ActionCounter: {from: domain.ChainPending, actor: roleRecipient, to: domain.ChainCountered},
	ActionCancel:  {from: domain.ChainPending, actor: roleInitiator, to: domain.ChainCancelled},
	ActionExpire:  {from: domain.ChainPending, actor: roleSystem, to: domain.ChainExpired},
}

// Apply проверяет действие и возвращает новый статус звена.
//
// Функция ничего не сохраняет: она отвечает на вопросы «можно ли» и «во что
// превратится», а запись в базу остаётся заботой вызывающего слоя.
func Apply(deal Deal, action Action, actorID string, now time.Time) (domain.ChainStatus, error) {
	transition, known := transitions[action]
	if !known {
		return "", domain.ErrInvalidTransition
	}

	if deal.Status.IsFinal() {
		return "", domain.ErrChainFinal
	}
	if deal.Status != transition.from {
		return "", domain.ErrInvalidTransition
	}

	if err := checkActor(deal, transition.actor, actorID); err != nil {
		return "", err
	}

	// Истёкшее предложение отвечать уже поздно, но пометить истёкшим — можно.
	if action != ActionExpire && IsExpired(deal, now) {
		return "", domain.ErrChainFinal
	}

	return transition.to, nil
}

func checkActor(deal Deal, role actorRole, actorID string) error {
	switch role {
	case roleSystem:
		return nil
	case roleRecipient:
		if deal.RecipientID != actorID {
			return actorError(deal, actorID)
		}
	case roleInitiator:
		if deal.InitiatorID != actorID {
			return actorError(deal, actorID)
		}
	}
	return nil
}

// actorError различает «ты вообще не отсюда» и «здесь ход не твой»: для
// человека это разные ситуации, и подсказка должна их различать.
func actorError(deal Deal, actorID string) error {
	if !deal.Involves(actorID) {
		return domain.ErrNotParticipant
	}
	return domain.ErrWrongActor
}

// IsExpired сообщает, истёк ли срок предложения.
func IsExpired(deal Deal, now time.Time) bool {
	return !deal.ExpiresAt.IsZero() && now.After(deal.ExpiresAt)
}

// Resolve превращает подтверждения сторон в итог обмена.
//
// Правило намеренно асимметрично: обмен считается состоявшимся только при
// согласии обеих сторон, а для провала достаточно одной. Человек, который
// приехал и не получил вещь, не должен зависеть от того, подтвердит ли это
// вторая сторона.
//
// Второе возвращаемое значение говорит, изменился ли итог: пока обе стороны
// не высказались, звено остаётся активным и ждёт.
func Resolve(deal Deal, confirmations []domain.ChainConfirmation) (domain.ChainStatus, bool) {
	if deal.Status != domain.ChainActive {
		return deal.Status, false
	}

	confirmed := make(map[string]bool, 2)
	for _, confirmation := range confirmations {
		if !deal.Involves(confirmation.CustomerID) {
			continue
		}
		if !confirmation.Success {
			return domain.ChainFailed, true
		}
		confirmed[confirmation.CustomerID] = true
	}

	if confirmed[deal.InitiatorID] && confirmed[deal.RecipientID] {
		return domain.ChainCompleted, true
	}

	return domain.ChainActive, false
}

// CanConfirm проверяет право пользователя подтверждать итог обмена.
func CanConfirm(deal Deal, actorID string, existing []domain.ChainConfirmation) error {
	if !deal.Involves(actorID) {
		return domain.ErrNotParticipant
	}
	if deal.Status != domain.ChainActive {
		return domain.ErrInvalidTransition
	}

	for _, confirmation := range existing {
		if confirmation.CustomerID == actorID {
			return domain.ErrAlreadyConfirmed
		}
	}

	return nil
}

// CanReview разрешает отзыв только по состоявшемуся обмену.
func CanReview(deal Deal, actorID string) error {
	if !deal.Involves(actorID) {
		return domain.ErrNotParticipant
	}
	if deal.Status != domain.ChainCompleted {
		return domain.ErrInvalidTransition
	}
	return nil
}

// CanWrite разрешает переписку, пока обмен не закрыт: договариваться о встрече
// нужно по активной сделке, а по закрытой писать уже некуда.
func CanWrite(deal Deal, actorID string) error {
	if !deal.Involves(actorID) {
		return domain.ErrNotParticipant
	}
	if deal.Status.IsFinal() {
		return domain.ErrChainFinal
	}
	return nil
}

// Validate проверяет звено перед созданием.
func Validate(deal Deal, offered, requested domain.Product) error {
	if deal.InitiatorID == deal.RecipientID {
		return domain.ErrSelfExchange
	}
	if offered.CustomerID != deal.InitiatorID || requested.CustomerID != deal.RecipientID {
		return domain.ErrNotParticipant
	}
	if offered.Status != domain.ProductActive || requested.Status != domain.ProductActive {
		return domain.ErrProductUnavailable
	}
	return nil
}
