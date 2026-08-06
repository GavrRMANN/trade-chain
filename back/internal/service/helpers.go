package service

import (
	"database/sql"
	"errors"
	"strings"

	"github.com/jackc/pgx/v5/pgconn"
)

func normalizeError(err error) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, sql.ErrNoRows) {
		return ErrNotFound
	}
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		switch pgErr.Code {
		case "23505":
			return ErrConflict
		case "23503", "23514", "22P02":
			return ErrInvalidInput
		}
	}
	return err
}

func blank(s string) bool { return strings.TrimSpace(s) == "" }

func validatePage(offset, limit int) (int, int, error) {
	if offset < 0 || limit < 0 {
		return 0, 0, ErrInvalidInput
	}
	if limit == 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	return offset, limit, nil
}
