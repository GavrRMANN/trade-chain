package domain

import (
	"time"
)

type Review struct {
	ReviewID string `json:"review_id"`
	// ChainID — сделка, по итогам которой оставлена оценка. Допускает NULL
	// ради отзывов, заведённых до появления привязки.
	ChainID        *string   `json:"chain_id,omitempty"`
	FromCustomerID string    `json:"from_customer_id"`
	ToCustomerID   string    `json:"to_customer_id"`
	ProductID      *string   `json:"product_id,omitempty"`
	Rating         int       `json:"rating"`
	Comment        string    `json:"comment,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
