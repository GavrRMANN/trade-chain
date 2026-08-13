#!/usr/bin/env bash
# Полный цикл E2E-прогона: поднимает отдельный тестовый стек (postgres-test +
# app-test + front-test) из docker-compose.test.yml, ждёт готовности, гоняет
# Playwright и гарантированно гасит стек вместе с БД по завершении — даже
# если тесты упали.
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.test.yml"
API_URL="http://localhost:8081"
FRONT_URL="http://localhost:3002"

cleanup() {
    echo "==> Гашу тестовый стек и удаляю тестовую БД..."
    docker compose -f "$COMPOSE_FILE" down -v
}
trap cleanup EXIT

echo "==> Поднимаю тестовый стек (postgres-test + app-test + front-test)..."
docker compose -f "$COMPOSE_FILE" up -d --build --wait

echo "==> Жду, пока backend ответит на ${API_URL}/health..."
until curl -sf "${API_URL}/health" >/dev/null 2>&1; do
    sleep 1
done

echo "==> Жду, пока frontend ответит на ${FRONT_URL}..."
until curl -sf "${FRONT_URL}" >/dev/null 2>&1; do
    sleep 1
done

echo "==> Стек готов. Запускаю Playwright..."
cd "$ROOT_DIR/front"

if [ ! -d node_modules ]; then
    echo "==> Устанавливаю зависимости фронтенда..."
    npm ci
fi

E2E_BASE_URL="$FRONT_URL" E2E_API_BASE_URL="$API_URL" npx playwright test "$@"
exit_code=$?

exit "$exit_code"
