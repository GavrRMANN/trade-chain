# Деплой на Vercel

Проект живёт двумя отдельными Vercel-проектами: фронт (Vite/SPA) и бэкенд
(Go под serverless-рантайм). База — Postgres (в текущем стенде — Neon).

## Что где лежит

| Часть | Vercel-проект | Корень | Конфиг |
| --- | --- | --- | --- |
| Фронт | `tvchbmen-front` | `front/` | `front/vercel.json` |
| Бэкенд | `tvchbmen-api` | `back/` | `back/vercel.json`, `back/api/index.go` |

- `back/api/index.go` — точка входа под Go-рантайм Vercel. Тот же
  `httpapi.NewRouter`, что и в `cmd/app`, но вместо `ListenAndServe` его
  вызывает платформа. Пул `pgxpool` и сервисы поднимаются один раз на инстанс
  (`sync.Once`), между тёплыми вызовами переиспользуются.
- `back/vercel.json` — `rewrites` всех путей на `/api/index`, чтобы chi-роутер
  видел исходный URL.
- `front/vercel.json` — SPA-fallback на `index.html` плюс прокси `/api/v1/*`,
  `/health`, `/swagger/*` на домен бэкенда. Благодаря прокси фронт и API живут
  на одном origin, и CORS в проде не нужен.

## Переменные окружения

Бэкенд (`tvchbmen-api`):

- `DATABASE_URL` — строка подключения к Postgres. Для serverless берём
  pooled-хост (`-pooler`) и небольшой `pool_max_conns`.

Фронт (`tvchbmen-front`):

- `VITE_API_BASE_URL` — базовый origin API. Указывает на сам фронт
  (`https://tvchbmen-front.vercel.app`), так как `/api/v1` проксируется на
  бэкенд через `front/vercel.json`.

## Первый деплой

```bash
# База: применить миграции по порядку
psql "$DATABASE_URL" \
  -f back/infrastructure/migrations/001_create_tables.sql \
  -f back/infrastructure/migrations/002_create_search_extension.sql \
  -f back/infrastructure/migrations/003_align_schema_with_domain.sql \
  -f back/infrastructure/migrations/004_exchange_negotiation.sql \
  -f back/infrastructure/migrations/005_exchange_offer_details.sql
# Демо-данные (опционально)
psql "$DATABASE_URL" -f back/infrastructure/migrations/test_case.sql

# Бэкенд
cd back && vercel link --project tvchbmen-api && vercel deploy --prod

# Фронт
cd ../front && vercel link --project tvchbmen-front && vercel deploy --prod
```

## Проверка после деплоя

```bash
curl https://tvchbmen-api.vercel.app/health            # {"status":"ok"}
curl https://tvchbmen-front.vercel.app/health          # тот же ответ через прокси
curl https://tvchbmen-front.vercel.app/api/v1/categories
```
