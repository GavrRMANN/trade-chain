package repository

import (
	"context"

	"trade-chain/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type notificationRepository struct {
	db *pgxpool.Pool
}

func NewNotificationRepository(db *pgxpool.Pool) NotificationRepository {
	return &notificationRepository{db: db}
}

func (r *notificationRepository) ListReads(ctx context.Context, customerID string) ([]domain.NotificationRead, error) {
	rows, err := r.db.Query(ctx, `
		SELECT chain_id, kind, read_at
		FROM chain_notification_reads
		WHERE customer_id = $1
	`, customerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	reads := make([]domain.NotificationRead, 0)
	for rows.Next() {
		var read domain.NotificationRead
		if err := rows.Scan(&read.ChainID, &read.Kind, &read.ReadAt); err != nil {
			return nil, err
		}
		reads = append(reads, read)
	}
	return reads, rows.Err()
}

func (r *notificationRepository) MarkRead(ctx context.Context, customerID, chainID string, kind domain.NotificationKind) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO chain_notification_reads (customer_id, chain_id, kind)
		VALUES ($1, $2, $3)
		ON CONFLICT (customer_id, chain_id, kind)
		DO UPDATE SET read_at = CURRENT_TIMESTAMP
	`, customerID, chainID, kind)
	return err
}
