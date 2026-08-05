package search

import "trade-chain/internal/domain"

type ReverseGraph struct {
	Nodes map[string][]domain.Product
}

func NewReverseGraph() *ReverseGraph {
	return &ReverseGraph{
		Nodes: make(map[string][]domain.Product),
	}
}

func (g *ReverseGraph) AddEdge(product domain.Product, wantedProduct domain.Product) {
	g.Nodes[wantedProduct.ProductID] = append(g.Nodes[wantedProduct.ProductID], product)
}
