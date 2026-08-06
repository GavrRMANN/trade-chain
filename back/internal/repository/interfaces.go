package repository

import (
	"context"
	"trade-chain/internal/domain"
)

type CustomerRepository interface {
	Create(ctx context.Context, customer *domain.CreateCustomerDTO) (*domain.Customer, error)
	GetByID(ctx context.Context, id string) (*domain.Customer, error)
	GetByEmail(ctx context.Context, email string) (*domain.Customer, error)
	Update(ctx context.Context, id string, customer *domain.UpdateCustomerDTO) (*domain.Customer, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, offset, limit int) ([]domain.Customer, error)
}

type ProductRepository interface {
	Create(ctx context.Context, product *domain.CreateProductDTO) (*domain.Product, error)
	GetByID(ctx context.Context, id string) (*domain.Product, error)
	GetByCustomerID(ctx context.Context, customerID string) ([]domain.Product, error)
	Update(ctx context.Context, id string, product *domain.UpdateProductDTO) (*domain.Product, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, offset, limit int) ([]domain.Product, error)
	Search(ctx context.Context, query string, categoryID *string) ([]domain.Product, error)
	GetExchangeCandidates(ctx context.Context, productID string) ([]domain.Product, error)
}

type CategoryRepository interface {
	Create(ctx context.Context, category *domain.Category) (*domain.Category, error)
	GetByID(ctx context.Context, id string) (*domain.Category, error)
	GetSubcategories(ctx context.Context, parentID string) ([]domain.Category, error)
	Update(ctx context.Context, id string, category *domain.Category) (*domain.Category, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context) ([]domain.Category, error)
}

type WishlistRepository interface {
	Create(ctx context.Context, wishlist *domain.Wishlist) (*domain.Wishlist, error)
	GetByID(ctx context.Context, id string) (*domain.Wishlist, error)
	GetByProductID(ctx context.Context, productID string) (*domain.Wishlist, error)
	AddCategoryOption(ctx context.Context, wishlistID, categoryID string) error
	RemoveCategoryOption(ctx context.Context, wishlistID, categoryID string) error
	GetOptions(ctx context.Context, wishlistID string) ([]domain.Category, error)
	Delete(ctx context.Context, id string) error
}

type ChainRepository interface {
	Create(ctx context.Context, chain *domain.Chain) (*domain.Chain, error)
	GetByID(ctx context.Context, id string) (*domain.Chain, error)
	GetByProductID(ctx context.Context, productID string) ([]domain.Chain, error)
	GetFullChain(ctx context.Context, chainID string) ([]domain.Chain, error)
	UpdateStatus(ctx context.Context, id string, status domain.ChainStatus) error
	CompleteExchange(ctx context.Context, chainID string) error // добавить
	Delete(ctx context.Context, id string) error
}

type ReviewRepository interface {
	Create(ctx context.Context, review *domain.Review) (*domain.Review, error)
	GetByID(ctx context.Context, id string) (*domain.Review, error)
	GetByCustomerID(ctx context.Context, customerID string) ([]domain.Review, error)
	GetAverageRating(ctx context.Context, customerID string) (float64, error)
	Delete(ctx context.Context, id string) error
}
