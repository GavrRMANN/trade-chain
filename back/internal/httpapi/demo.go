package httpapi

import (
	"context"
	"crypto/subtle"
	"net/http"

	"trade-chain/infrastructure/migrations"
	"trade-chain/internal/service"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Порядок важен: сначала то, что ссылается на цепочки и товары, иначе внешние
// ключи не дадут очистить таблицы.
var demoResetTables = []string{
	"chain_notification_reads",
	"chain_confirmations",
	"chain_messages",
	"reviews",
	"chains",
	"wishlist_options",
	"wishlists",
	"customer_wishlist_options",
	"products",
	"customers",
	"categories",
}

type demoHandler struct {
	db     *pgxpool.Pool
	secret []byte
}

// mountDemoRoutes поднимает служебные маршруты демо-стенда.
//
// Маршрут не монтируется, пока не задан секрет: сброс стирает все обмены,
// и открывать его без явной настройки нельзя.
func mountDemoRoutes(r chi.Router, db *pgxpool.Pool, secret string) {
	if db == nil || secret == "" {
		return
	}
	h := demoHandler{db: db, secret: []byte(secret)}
	r.Post("/demo/reset", h.reset)
}

// DemoResetResponse описывает результат сброса демо-данных.
type DemoResetResponse struct {
	Status string `json:"status"`
}

// reset godoc
// @Summary Reset demo data
// @Description Wipe exchange data and re-apply the demo seed. Available only when DEMO_LOGIN_ENABLED=true and DEMO_RESET_SECRET is configured
// @Tags demo
// @Produce json
// @Param Authorization header string true "Bearer <DEMO_RESET_SECRET>"
// @Success 200 {object} DemoResetResponse
// @Failure 401 {object} ErrorResponse
// @Failure 403 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /demo/reset [post]
//
// Несколько проверяющих работают с одним стендом и портят друг другу
// подготовленные состояния: принятое предложение нельзя вернуть в ожидание
// через обычный API. Поэтому сброс делает ровно одно — возвращает стенд к
// исходному сиду целиком. Выборочный сброс одного профиля от этой проблемы
// не спасает: состояние всегда общее для обеих сторон обмена.
func (h demoHandler) reset(w http.ResponseWriter, r *http.Request) {
	if !demoLoginEnabled() {
		writeError(w, service.ErrForbidden)
		return
	}

	token := []byte(r.Header.Get("Authorization"))
	expected := append([]byte("Bearer "), h.secret...)
	if subtle.ConstantTimeCompare(token, expected) != 1 {
		writeJSON(w, http.StatusUnauthorized, ErrorResponse{Error: "unauthorized"})
		return
	}

	if err := h.applySeed(r.Context()); err != nil {
		writeError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, DemoResetResponse{Status: "ok"})
}

// applySeed очищает пользовательские данные и заново применяет сид.
//
// Всё выполняется одной транзакцией: наполовину очищенный стенд хуже
// испорченного, потому что выглядит рабочим.
func (h demoHandler) applySeed(ctx context.Context) error {
	tx, err := h.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	for _, table := range demoResetTables {
		if _, err := tx.Exec(ctx, "TRUNCATE TABLE "+table+" CASCADE"); err != nil {
			return err
		}
	}

	// Сид-файлы содержат собственные BEGIN/COMMIT. Внутри уже открытой
	// транзакции Postgres их игнорирует с предупреждением, а не с ошибкой,
	// поэтому отдельная обработка не нужна.
	for _, seed := range []string{migrations.SeedMockData, migrations.SeedDemoAccounts} {
		if _, err := tx.Exec(ctx, seed); err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}
