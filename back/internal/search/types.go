package search

import "trade-chain/internal/domain"

type Graph struct {
	Nodes map[string][]domain.Product
}
