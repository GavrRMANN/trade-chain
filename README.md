# xakaton_avito

## Запуск

```bash
docker compose up --build
```

Compose поднимает PostgreSQL (`localhost:5432`), API (`http://localhost:8080`) и frontend (`http://localhost:3000`). При первом создании тома PostgreSQL применяет миграции и заполняет таблицы данными из `front/mock-api/data.js`.

Тестовые пользователи используют пароль `password123` (например, `alexey@example.com`).

После изменения mock-данных обновите сид и пересоздайте том базы:

```bash
node scripts/generate-mock-seed.mjs
docker compose down -v
docker compose up --build
```

Полный сброс локальной базы:

```bash
docker compose down -v
```
