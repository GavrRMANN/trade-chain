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

func (r *productRepository) Create(ctx context.Context, dto *domain.CreateProductDTO) (*domain.Product, error) {
	query := `
		INSERT INTO products (customer_id, category_id, title, description, image, price, location, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING product_id, customer_id, category_id, title, description, image, price, location, status, created_at, updated_at
	`

	var created domain.Product
	err := r.db.QueryRow(ctx, query,
		dto.CustomerID,
		dto.CategoryID,
		dto.Title,
		dto.Description,
		dto.Image,
		dto.Price,
		dto.Location,
		dto.Status,
	).Scan(
		&created.ProductID,
		&created.CustomerID,
		&created.CategoryID,
		&created.Title,
		&created.Description,
		&created.Image,
		&created.Price,
		&created.Location,
		&created.Status,
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
		SELECT product_id, customer_id, category_id, title, description, image, price, location, status, created_at, updated_at
		FROM products
		WHERE product_id = $1 AND status != 'archived'
	`

	var product domain.Product
	err := r.db.QueryRow(ctx, query, id).Scan(
		&product.ProductID,
		&product.CustomerID,
		&product.CategoryID,
		&product.Title,
		&product.Description,
		&product.Image,
		&product.Price,
		&product.Location,
		&product.Status,
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
		SELECT product_id, customer_id, category_id, title, description, image, price, location, status, created_at, updated_at
		FROM products
		WHERE customer_id = $1 AND status != 'archived'
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query, customerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []domain.Product
	for rows.Next() {
		var p domain.Product
		if err := rows.Scan(
			&p.ProductID,
			&p.CustomerID,
			&p.CategoryID,
			&p.Title,
			&p.Description,
			&p.Image,
			&p.Price,
			&p.Location,
			&p.Status,
			&p.CreatedAt,
			&p.UpdatedAt,
		); err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	return products, rows.Err()
}

func (r *productRepository) Update(ctx context.Context, id string, dto *domain.UpdateProductDTO) (*domain.Product, error) {
	query := `
		UPDATE products
		SET
			title = COALESCE($1, title),
			description = COALESCE($2, description),
			category_id = COALESCE($3, category_id),
			image = COALESCE($4, image),
			price = COALESCE($5, price),
			location = COALESCE($6, location),
			status = COALESCE($7, status)
		WHERE product_id = $8
		RETURNING product_id, customer_id, category_id, title, description, image, price, location, status, created_at, updated_at
	`

	var updated domain.Product
	err := r.db.QueryRow(ctx, query,
		dto.Title,
		dto.Description,
		dto.CategoryID,
		dto.Image,
		dto.Price,
		dto.Location,
		dto.Status,
		id,
	).Scan(
		&updated.ProductID,
		&updated.CustomerID,
		&updated.CategoryID,
		&updated.Title,
		&updated.Description,
		&updated.Image,
		&updated.Price,
		&updated.Location,
		&updated.Status,
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
	query := `UPDATE products SET status = 'archived' WHERE product_id = $1`
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
		SELECT product_id, customer_id, category_id, title, description, image, price, location, status, created_at, updated_at
		FROM products
		WHERE status != 'archived'
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
		var p domain.Product
		if err := rows.Scan(
			&p.ProductID,
			&p.CustomerID,
			&p.CategoryID,
			&p.Title,
			&p.Description,
			&p.Image,
			&p.Price,
			&p.Location,
			&p.Status,
			&p.CreatedAt,
			&p.UpdatedAt,
		); err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	return products, rows.Err()
}

// Search – аналогично, но в SELECT и WHERE теперь используются title/status
func (r *productRepository) Search(ctx context.Context, search string, categoryID *string) ([]domain.Product, error) {
	query := `
		SELECT
			product_id, customer_id, category_id, title, description, image, price, location, status, created_at, updated_at,
			(
				0.60 * ts_rank_cd(search_vector, websearch_to_tsquery('simple', $1)) +
				0.25 * similarity(title, $1) +
				0.15 * similarity(description, $1)
			) AS score
		FROM products
		WHERE
			status != 'archived'
			AND (
				search_vector @@ websearch_to_tsquery('simple', $1)
				OR title % $1
				OR description % $1
			)
	`

	args := []interface{}{search}
	if categoryID != nil {
		query += ` AND category_id = $2`
		args = append(args, *categoryID)
	}
	query += ` ORDER BY score DESC, created_at DESC LIMIT 100`

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []domain.Product
	for rows.Next() {
		var p domain.Product
		var score float64
		if err := rows.Scan(
			&p.ProductID,
			&p.CustomerID,
			&p.CategoryID,
			&p.Title,
			&p.Description,
			&p.Image,
			&p.Price,
			&p.Location,
			&p.Status,
			&p.CreatedAt,
			&p.UpdatedAt,
			&score,
		); err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	return products, rows.Err()
}

func (r *productRepository) GetExchangeCandidates(ctx context.Context, productID string) ([]domain.Product, error) {
	query := `
		SELECT DISTINCT
			p.product_id, p.customer_id, p.category_id, p.title, p.description,
			p.image, p.price, p.location, p.status, p.created_at, p.updated_at
		FROM products source
		JOIN wishlists w ON w.product_id = source.product_id
		JOIN wishlist_options wo ON wo.wishlist_id = w.wishlist_id
		JOIN products p ON p.category_id = wo.category_id
		WHERE
			source.product_id = $1
			AND p.status != 'archived'
			AND p.product_id <> source.product_id
			AND p.customer_id <> source.customer_id
		ORDER BY p.created_at DESC
	`

	rows, err := r.db.Query(ctx, query, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []domain.Product
	for rows.Next() {
		var p domain.Product
		if err := rows.Scan(
			&p.ProductID,
			&p.CustomerID,
			&p.CategoryID,
			&p.Title,
			&p.Description,
			&p.Image,
			&p.Price,
			&p.Location,
			&p.Status,
			&p.CreatedAt,
			&p.UpdatedAt,
		); err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	return products, rows.Err()
}
