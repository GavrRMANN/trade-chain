package repository

import (
	"context"
	"database/sql"
	"errors"
	"trade-chain/internal/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type productRepository struct {
	db *pgxpool.Pool
}

func NewProductRepository(db *pgxpool.Pool) ProductRepository {
	return &productRepository{db: db}
}

func (r *productRepository) Create(ctx context.Context, product *domain.CreateProductDTO) (*domain.Product, error) {
	query := `
		INSERT INTO products (customer_id, category_id, name, description)
		VALUES ($1, $2, $3, $4)
		RETURNING product_id, customer_id, category_id, name, description, is_active, created_at, updated_at
	`

	var created domain.Product
	err := r.db.QueryRow(ctx, query,
		product.CustomerID,
		product.CategoryID,
		product.Name,
		product.Description,
	).Scan(
		&created.ProductID,
		&created.CustomerID,
		&created.CategoryID,
		&created.Name,
		&created.Description,
		&created.IsActive,
		&created.CreatedAt,
		&created.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &created, nil
}

func (r *productRepository) GetByID(ctx context.Context, id string) (*domain.Product, error) {
	query := `
		SELECT product_id, customer_id, category_id, name, description, is_active, created_at, updated_at
		FROM products
		WHERE product_id = $1 AND is_active = true
	`

	var product domain.Product
	err := r.db.QueryRow(ctx, query, id).Scan(
		&product.ProductID,
		&product.CustomerID,
		&product.CategoryID,
		&product.Name,
		&product.Description,
		&product.IsActive,
		&product.CreatedAt,
		&product.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, err
	}

	return &product, nil
}

func (r *productRepository) GetByCustomerID(ctx context.Context, customerID string) ([]domain.Product, error) {
	query := `
		SELECT product_id, customer_id, category_id, name, description, is_active, created_at, updated_at
		FROM products
		WHERE customer_id = $1 AND is_active = true
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query, customerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []domain.Product
	for rows.Next() {
		var product domain.Product
		err := rows.Scan(
			&product.ProductID,
			&product.CustomerID,
			&product.CategoryID,
			&product.Name,
			&product.Description,
			&product.IsActive,
			&product.CreatedAt,
			&product.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		products = append(products, product)
	}

	return products, nil
}

func (r *productRepository) Update(ctx context.Context, id string, product *domain.UpdateProductDTO) (*domain.Product, error) {
	query := `
		UPDATE products
		SET name = COALESCE($1, name),
		    description = COALESCE($2, description),
		    category_id = COALESCE($3, category_id),
		    is_active = COALESCE($4, is_active)
		WHERE product_id = $5
		RETURNING product_id, customer_id, category_id, name, description, is_active, created_at, updated_at
	`

	var updated domain.Product
	err := r.db.QueryRow(ctx, query,
		product.Name,
		product.Description,
		product.CategoryID,
		product.IsActive,
		id,
	).Scan(
		&updated.ProductID,
		&updated.CustomerID,
		&updated.CategoryID,
		&updated.Name,
		&updated.Description,
		&updated.IsActive,
		&updated.CreatedAt,
		&updated.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, err
	}

	return &updated, nil
}

func (r *productRepository) Delete(ctx context.Context, id string) error {
	query := `UPDATE products SET is_active = false WHERE product_id = $1`
	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *productRepository) List(ctx context.Context, offset, limit int) ([]domain.Product, error) {
	query := `
		SELECT product_id, customer_id, category_id, name, description, is_active, created_at, updated_at
		FROM products
		WHERE is_active = true
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []domain.Product
	for rows.Next() {
		var product domain.Product
		err := rows.Scan(
			&product.ProductID,
			&product.CustomerID,
			&product.CategoryID,
			&product.Name,
			&product.Description,
			&product.IsActive,
			&product.CreatedAt,
			&product.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		products = append(products, product)
	}

	return products, nil
}

func (r *productRepository) Search(ctx context.Context, query string, categoryID *string) ([]domain.Product, error) {
	sqlQuery := `
		SELECT product_id, customer_id, category_id, name, description, is_active, created_at, updated_at
		FROM products
		WHERE is_active = true
		AND (LOWER(name) LIKE LOWER($1) OR LOWER(description) LIKE LOWER($2))
	`
	args := []interface{}{"%" + query + "%", "%" + query + "%"}

	if categoryID != nil {
		sqlQuery += " AND category_id = $3"
		args = append(args, categoryID)
	}

	sqlQuery += " ORDER BY created_at DESC"

	rows, err := r.db.Query(ctx, sqlQuery, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []domain.Product
	for rows.Next() {
		var product domain.Product
		err := rows.Scan(
			&product.ProductID,
			&product.CustomerID,
			&product.CategoryID,
			&product.Name,
			&product.Description,
			&product.IsActive,
			&product.CreatedAt,
			&product.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		products = append(products, product)
	}

	return products, nil
}
