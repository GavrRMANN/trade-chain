package search

import (
	"trade-chain/internal/domain"
)

type ChainResult struct {
	Products []domain.Product

	Length int
}

type queueNode struct {
	Product domain.Product

	Path []domain.Product

	Depth int
}

func FindChain(
	graph *ReverseGraph,
	target domain.Product,
	userProducts []domain.Product,
	maxDepth int,
) *ChainResult {

	myProducts := make(map[string]bool)

	for _, product := range userProducts {
		myProducts[product.ProductID] = true
	}

	queue := []queueNode{

		{
			Product: target,
			Path: []domain.Product{
				target,
			},
			Depth: 0,
		},
	}

	visited := make(map[string]bool)

	visited[target.ProductID] = true

	for len(queue) > 0 {

		current := queue[0]

		queue = queue[1:]

		if current.Depth >= maxDepth {
			continue
		}

		neighbors :=
			graph.Nodes[current.Product.ProductID]

		for _, next := range neighbors {

			if visited[next.ProductID] {
				continue
			}

			visited[next.ProductID] = true

			newPath :=
				append(
					append([]domain.Product{}, current.Path...),
					next,
				)

			if myProducts[next.ProductID] {

				return &ChainResult{

					Products: reverse(newPath),

					Length: len(newPath) - 1,
				}
			}

			queue = append(
				queue,
				queueNode{

					Product: next,

					Path: newPath,

					Depth: current.Depth + 1,
				},
			)
		}
	}

	return nil
}

func reverse(
	items []domain.Product,
) []domain.Product {

	for i, j := 0, len(items)-1; i < j; i, j = i+1, j-1 {

		items[i], items[j] =
			items[j], items[i]
	}

	return items
}
