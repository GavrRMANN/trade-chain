package domain

import (
	"time"
)

type Chain struct {
	ChainID         string    `json:"chain_id"`
	FromProductID   string    `json:"from_product_id"`
	ToProductID     string    `json:"to_product_id"`
	InitiatorID     string    `json:"initiator_id"`
	PreviousChainID *string   `json:"previous_chain_id,omitempty"`
	NextChainID     *string   `json:"next_chain_id,omitempty"`
	Status          string    `json:"status"`
	Message         string    `json:"message,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type ChainStatus string

const (
	ChainPending   ChainStatus = "pending"
	ChainActive    ChainStatus = "active"
	ChainCompleted ChainStatus = "completed"
	ChainCancelled ChainStatus = "cancelled"
	ChainRejected  ChainStatus = "rejected" // дополнительный статус
)
