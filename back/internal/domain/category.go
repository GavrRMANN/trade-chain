package domain

import (
	"time"
)

type Category struct {
	CategoryID string    `json:"category_id"`
	Name       string    `json:"name"`
	Icon       string    `json:"icon"`
	ParentID   *string   `json:"parent_id,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
