package events

import (
	"context"
	"encoding/json"
	"sync"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

const (
	maxSubscribersPerCustomer = 4
	maxSubscribersTotal       = 1_000
)

const (
	ExchangeOfferCreated        = "exchange.offer.created"
	ExchangeChainUpdated        = "exchange.chain.updated"
	ExchangeConfirmationCreated = "exchange.confirmation.created"
	ExchangeMessageCreated      = "exchange.message.created"
	ExchangeCompleted           = "exchange.completed"
	ExchangeChainDeleted        = "exchange.chain.deleted"
)

const notificationChannel = "trade_chain_events"

// Event содержит только данные, необходимые клиенту для адресного обновления кэша.
type Event struct {
	Type    string `json:"type"`
	ChainID string `json:"chain_id"`
}

type Broker struct {
	mu          sync.RWMutex
	subscribers map[string]map[chan Event]struct{}
	connections int
	db          *pgxpool.Pool
	instanceID  string
}

type notification struct {
	Event
	CustomerIDs []string `json:"customer_ids"`
	Source      string   `json:"source"`
}

func NewBroker(pools ...*pgxpool.Pool) *Broker {
	b := &Broker{
		subscribers: make(map[string]map[chan Event]struct{}),
		instanceID:  uuid.NewString(),
	}
	if len(pools) > 0 && pools[0] != nil {
		b.db = pools[0]
		go b.listen()
	}
	return b
}

func (b *Broker) Subscribe(customerID string) (<-chan Event, func(), bool) {
	ch := make(chan Event, 16)
	b.mu.Lock()
	if len(b.subscribers[customerID]) >= maxSubscribersPerCustomer || b.connections >= maxSubscribersTotal {
		b.mu.Unlock()
		return nil, func() {}, false
	}
	if b.subscribers[customerID] == nil {
		b.subscribers[customerID] = make(map[chan Event]struct{})
	}
	b.subscribers[customerID][ch] = struct{}{}
	b.connections++
	b.mu.Unlock()

	return ch, func() {
		b.mu.Lock()
		defer b.mu.Unlock()
		delete(b.subscribers[customerID], ch)
		b.connections--
		if len(b.subscribers[customerID]) == 0 {
			delete(b.subscribers, customerID)
		}
	}, true
}

// Publish не блокирует обработку HTTP-запроса из-за медленного клиента.
func (b *Broker) Publish(event Event, customerIDs ...string) {
	b.publishLocal(event, customerIDs...)
	if b.db == nil {
		return
	}

	payload, err := json.Marshal(notification{
		Event:       event,
		CustomerIDs: customerIDs,
		Source:      b.instanceID,
	})
	if err != nil {
		return
	}
	go func() {
		_, _ = b.db.Exec(context.Background(), "SELECT pg_notify($1, $2)", notificationChannel, string(payload))
	}()
}

func (b *Broker) publishLocal(event Event, customerIDs ...string) {
	b.mu.RLock()
	defer b.mu.RUnlock()
	for _, customerID := range customerIDs {
		for ch := range b.subscribers[customerID] {
			select {
			case ch <- event:
			default:
			}
		}
	}
}

func (b *Broker) listen() {
	ctx := context.Background()
	conn, err := b.db.Acquire(ctx)
	if err != nil {
		return
	}
	defer conn.Release()
	if _, err := conn.Exec(ctx, "LISTEN "+notificationChannel); err != nil {
		return
	}

	for {
		n, err := conn.Conn().WaitForNotification(ctx)
		if err != nil {
			return
		}
		var payload notification
		if json.Unmarshal([]byte(n.Payload), &payload) != nil || payload.Source == b.instanceID {
			continue
		}
		b.publishLocal(payload.Event, payload.CustomerIDs...)
	}
}
