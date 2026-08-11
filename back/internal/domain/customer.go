package domain

import (
	"time"
)

type Customer struct {
	CustomerID string `json:"customer_id"`
	Email      string `json:"email"`
	// FullName — ФИО участника. Не обязательно: идентификатором остаётся
	// email, имя — то, что видит вторая сторона обмена.
	FullName     string    `json:"full_name"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// CustomerOverview — участник вместе с тем, что он успел на площадке.
//
// Рейтинг и счётчики не лежат полями в customers, а считаются из отзывов,
// товаров и цепочек. Хранимые счётчики пришлось бы обновлять на каждом
// изменении товара и каждом переходе статуса обмена, и они разошлись бы с
// реальностью при первом же откате транзакции или ручной правке данных.
type CustomerOverview struct {
	CustomerID string `json:"customer_id"`
	Email      string `json:"email"`
	FullName   string `json:"full_name"`
	// Rating — средняя оценка из отзывов о пользователе, 0 при их отсутствии.
	Rating float64 `json:"rating"`
	// ReviewCount идёт рядом с рейтингом: 5.0 по одному отзыву и 4.6 по сорока
	// это разные вещи, а без числа отзывов они выглядят одинаково.
	ReviewCount int `json:"review_count"`
	// ProductCount — все товары пользователя, включая архивные и обменянные.
	ProductCount int `json:"product_count"`
	// ActiveProductCount — товары в статусе active, то есть то, что реально
	// доступно к обмену прямо сейчас.
	ActiveProductCount int `json:"active_product_count"`
	// ChainCount — цепочки обмена, где пользователь инициатор или получатель,
	// в любом статусе.
	ChainCount int       `json:"chain_count"`
	CreatedAt  time.Time `json:"created_at"`
}

type CreateCustomerDTO struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
	FullName string `json:"full_name" validate:"omitempty,max=255"`
}

type UpdateCustomerDTO struct {
	Email    *string `json:"email" validate:"omitempty,email"`
	Password *string `json:"password" validate:"omitempty,min=8"`
	FullName *string `json:"full_name" validate:"omitempty,max=255"`
}
