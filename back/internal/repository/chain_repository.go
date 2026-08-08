package repository

import (
	"context"
	"database/sql"
	"errors"
	"time"
	"trade-chain/internal/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type chainRepository struct {
	db *pgxpool.Pool
}

func NewChainRepository(db *pgxpool.Pool) ChainRepository {
	return &chainRepository{db: db}
}

// chainColumns перечислены один раз намеренно: список повторялся в четырёх
// запросах, и добавление колонки требовало не забыть ни один из них.
const chainColumns = `chain_id, from_product_id, to_product_id, initiator_id, recipient_id,
	previous_chain_id, next_chain_id, status, message, expires_at, created_at, updated_at`

// rowScanner покрывает и одиночную строку, и строку выборки: у pgx.Row
// и pgx.Rows одинаковый Scan, так что разбор звена пишется один раз.
type rowScanner interface {
	Scan(dest ...any) error
}

func scanChain(row rowScanner) (domain.Chain, error) {
	var chain domain.Chain
	err := row.Scan(
		&chain.ChainID,
		&chain.FromProductID,
		&chain.ToProductID,
		&chain.InitiatorID,
		&chain.RecipientID,
		&chain.PreviousChainID,
		&chain.NextChainID,
		&chain.Status,
		&chain.Message,
		&chain.ExpiresAt,
		&chain.CreatedAt,
		&chain.UpdatedAt,
	)
	return chain, err
}

func (r *chainRepository) queryChains(ctx context.Context, query string, args ...any) ([]domain.Chain, error) {
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	chains := make([]domain.Chain, 0)
	for rows.Next() {
		chain, err := scanChain(rows)
		if err != nil {
			return nil, err
		}
		chains = append(chains, chain)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return chains, nil
}

func (r *chainRepository) Create(ctx context.Context, chain *domain.Chain) (*domain.Chain, error) {
	query := `
		INSERT INTO chains (from_product_id, to_product_id, initiator_id, recipient_id, previous_chain_id, next_chain_id, status, message, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, CURRENT_TIMESTAMP + INTERVAL '72 hours'))
		RETURNING ` + chainColumns

	// Нулевое время означает «срок не задан» — базе передаётся NULL,
	// и она подставляет свой срок по умолчанию.
	var expiresAt *time.Time
	if !chain.ExpiresAt.IsZero() {
		expiresAt = &chain.ExpiresAt
	}

	created, err := scanChain(r.db.QueryRow(ctx, query,
		chain.FromProductID,
		chain.ToProductID,
		chain.InitiatorID,
		chain.RecipientID,
		chain.PreviousChainID,
		chain.NextChainID,
		chain.Status,
		chain.Message,
		expiresAt,
	))
	if err != nil {
		return nil, err
	}
	return &created, nil
}

func (r *chainRepository) GetByID(ctx context.Context, id string) (*domain.Chain, error) {
	query := `SELECT ` + chainColumns + ` FROM chains WHERE chain_id = $1`

	chain, err := scanChain(r.db.QueryRow(ctx, query, id))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, sql.ErrNoRows
		}
		return nil, err
	}
	return &chain, nil
}

func (r *chainRepository) GetByProductID(ctx context.Context, productID string) ([]domain.Chain, error) {
	query := `
		SELECT ` + chainColumns + `
		FROM chains
		WHERE from_product_id = $1 OR to_product_id = $1
		ORDER BY created_at DESC
	`
	return r.queryChains(ctx, query, productID)
}

// GetByCustomerID отдаёт все сделки человека — и те, что он предложил сам,
// и те, что предложили ему. Без этого запроса на фронте нет входящих:
// пользователь узнаёт о предложении, только если знает его идентификатор.
func (r *chainRepository) GetByCustomerID(ctx context.Context, customerID string) ([]domain.Chain, error) {
	query := `
		SELECT ` + chainColumns + `
		FROM chains
		WHERE initiator_id = $1 OR recipient_id = $1
		ORDER BY created_at DESC
	`
	return r.queryChains(ctx, query, customerID)
}

func (r *chainRepository) GetFullChain(ctx context.Context, chainID string) ([]domain.Chain, error) {
	query := `
		WITH RECURSIVE chain_path AS (
			SELECT ` + chainColumns + `
			FROM chains
			WHERE chain_id = $1
			UNION ALL
			SELECT c.chain_id, c.from_product_id, c.to_product_id, c.initiator_id, c.recipient_id,
				c.previous_chain_id, c.next_chain_id, c.status, c.message, c.expires_at, c.created_at, c.updated_at
			FROM chains c
			INNER JOIN chain_path cp ON c.chain_id = cp.next_chain_id OR c.chain_id = cp.previous_chain_id
		)
		SELECT ` + chainColumns + `
		FROM chain_path
		ORDER BY created_at
	`
	return r.queryChains(ctx, query, chainID)
}

func (r *chainRepository) UpdateStatus(ctx context.Context, id string, status domain.ChainStatus) error {
	query := `UPDATE chains SET status = $1 WHERE chain_id = $2`
	result, err := r.db.Exec(ctx, query, string(status), id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return sql.ErrNoRows
	}
	return nil
}

// CompleteExchange завершает обмен: меняет владельцев товаров и обновляет статус
func (r *chainRepository) CompleteExchange(ctx context.Context, chainID string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// 1. Получить цепочку
	var chain domain.Chain
	err = tx.QueryRow(ctx, `
		SELECT chain_id, from_product_id, to_product_id, initiator_id, status
		FROM chains
		WHERE chain_id = $1
		FOR UPDATE
	`, chainID).Scan(
		&chain.ChainID,
		&chain.FromProductID,
		&chain.ToProductID,
		&chain.InitiatorID,
		&chain.Status,
	)
	if err != nil {
		return err
	}

	if chain.Status != string(domain.ChainActive) {
		return errors.New("chain must be active to complete")
	}

	// 2. Получить текущих владельцев
	var fromOwner, toOwner string
	err = tx.QueryRow(ctx, `
		SELECT customer_id FROM products WHERE product_id = $1
	`, chain.FromProductID).Scan(&fromOwner)
	if err != nil {
		return err
	}
	err = tx.QueryRow(ctx, `
		SELECT customer_id FROM products WHERE product_id = $1
	`, chain.ToProductID).Scan(&toOwner)
	if err != nil {
		return err
	}

	// 3. Обменять владельцев
	_, err = tx.Exec(ctx, `
		UPDATE products SET customer_id = $1 WHERE product_id = $2
	`, toOwner, chain.FromProductID)
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `
		UPDATE products SET customer_id = $1 WHERE product_id = $2
	`, fromOwner, chain.ToProductID)
	if err != nil {
		return err
	}

	// 4. Обновить статус цепочки
	_, err = tx.Exec(ctx, `
		UPDATE chains SET status = $1 WHERE chain_id = $2
	`, string(domain.ChainCompleted), chainID)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *chainRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM chains WHERE chain_id = $1`
	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return sql.ErrNoRows
	}
	return nil
}
