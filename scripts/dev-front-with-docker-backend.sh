#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_URL="$(grep -m1 '^VITE_API_BASE_URL=' "$ROOT_DIR/front/.env.docker-api" | cut -d= -f2-)"

cd "$ROOT_DIR"

echo "==> Поднимаю backend (postgres + app) в Docker..."
docker compose up -d --build postgres app

echo "==> Жду, пока backend ответит на /health..."
until curl -sf "${API_URL}/health" >/dev/null 2>&1; do
    sleep 1
done
echo "==> Backend готов: ${API_URL}"

cd "$ROOT_DIR/front"

if [ ! -d node_modules ]; then
    echo "==> Устанавливаю зависимости фронтенда..."
    npm install
fi

echo "==> Запускаю frontend dev server (API: ${API_URL})..."
VITE_API_BASE_URL="$API_URL" npm run dev
