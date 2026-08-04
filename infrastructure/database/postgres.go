package database

import (
	"context"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

type DatabaseConnection struct {
	Pool *pgxpool.Pool
}

func NewConnection() (*DatabaseConnection, error) {
	ctx := context.Background()

	pool, err := pgxpool.New(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		return nil, err
	}

	if err := pool.Ping(ctx); err != nil {
		return nil, err
	}

	return &DatabaseConnection{Pool: pool}, nil
}

func (c *DatabaseConnection) Close() {
	c.Pool.Close()
}
