package domain

import (
	"time"
)

type Product struct {
	ProductID   string    `json:"product_id"`
	CustomerID  string    `json:"customer_id"`
	CategoryID  *string   `json:"category_id,omitempty"`
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreateProductDTO struct {
	CustomerID  string  `json:"customer_id" validate:"required"`
	CategoryID  *string `json:"category_id"`
	Name        string  `json:"name" validate:"required"`
	Description string  `json:"description"`
}

type UpdateProductDTO struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
	CategoryID  *string `json:"category_id"`
	IsActive    *bool   `json:"is_active"`
}
