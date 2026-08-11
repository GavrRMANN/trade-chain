package events

import "sync"

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
)

// Event содержит только данные, необходимые клиенту для адресного обновления кэша.
type Event struct {
	Type    string `json:"type"`
	ChainID string `json:"chain_id"`
}

type Broker struct {
	mu          sync.RWMutex
	subscribers map[string]map[chan Event]struct{}
	connections int
}

func NewBroker() *Broker {
	return &Broker{subscribers: make(map[string]map[chan Event]struct{})}
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
