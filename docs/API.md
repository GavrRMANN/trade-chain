# API MVP: последовательные обмены

Базовый путь API: `/api/v1`. Авторизованные запросы передают
`Authorization: Bearer <access_token>`. Идентификаторы - UUID, даты - ISO 8601.

## Принцип работы

Маршрут обмена - персональная рекомендация, а не единая многосторонняя сделка.
На каждом шаге пользователь отправляет отдельные двусторонние предложения
владельцам рекомендованных товаров. Успешный обмен делает полученный товар
текущим; сервер пересчитывает только оставшуюся часть маршрута. Отказ по одному
из предложений не отменяет остальные и не блокирует чужие товары.

`Chain` из текущей модели следует трактовать как **ребро рекомендации** между
товарами. Для пользовательского сценария нужны самостоятельные сущности:

- `exchange_goal` - цель конкретного пользователя и исходный товар;
- `exchange_route` - выбранный рекомендованный маршрут;
- `exchange_offer` - реальное двустороннее предложение и его жизненный цикл;
- `exchange` - подтверждённый обмен.

Так `Chain` не используется как сделка и не связывает участников, которые ещё
ничего не подтвердили.

## Статусы

| Ресурс | Значения |
| --- | --- |
| `product.status` | `active`, `reserved`, `exchanged`, `archived` |
| `goal.status` | `active`, `achieved`, `stopped`, `no_candidates` |
| `route.status` | `active`, `outdated`, `completed`, `cancelled` |
| `route_step.status` | `current`, `planned`, `completed`, `skipped` |
| `offer.status` | `pending`, `accepted`, `declined`, `cancelled`, `expired`, `completed` |
| `exchange.status` | `awaiting_initiator`, `awaiting_recipient`, `completed`, `failed` |

Переход в `completed` возможен только после двух подтверждений результата.
После него оба товара получают `exchanged`; сервер создаёт их новые экземпляры
у новых владельцев с `active` (или переносит владение, если так выбрана модель
каталога), помечает шаг маршрута выполненным и пересчитывает рекомендации.

## Общий формат ошибок

```json
{
  "error": {
    "code": "offer_already_resolved",
    "message": "Предложение уже обработано"
  }
}
```

Коды: `validation_error` (400), `unauthorized` (401), `forbidden` (403),
`not_found` (404), `conflict` (409), `offer_already_resolved` (409),
`product_unavailable` (409).

## Авторизация и профиль

| Метод | URL | Назначение |
| --- | --- | --- |
| `POST` | `/auth/register` | Регистрация и выдача токенов |
| `POST` | `/auth/login` | Вход |
| `GET` | `/me` | Текущий профиль, рейтинг и счётчики |
| `GET` | `/users/{userId}` | Публичный профиль и отзывы |

`POST /auth/register`

```json
{ "email": "anna@example.com", "password": "secret123" }
```

## Товары, желания и поиск

| Метод | URL | Назначение |
| --- | --- | --- |
| `GET` | `/products?q=&category_id=&page=&limit=` | Каталог и поиск |
| `GET` | `/products/{productId}` | Карточка товара, владелец, wishlist и мини-цепочка |
| `POST` | `/products` | Создать объявление |
| `PATCH` | `/products/{productId}` | Изменить своё объявление |
| `POST` | `/products/{productId}/archive` | Снять товар с обмена |
| `PUT` | `/products/{productId}/wishlist` | Задать, что владелец хочет получить |
| `GET` | `/products/{productId}/recommendations` | Подходящие прямые товары |

`POST /products`

```json
{
  "category_id": "c6a4...",
  "name": "Горный велосипед",
  "description": "Размер M, исправен",
  "wishlist": {
    "name": "Смартфон или ноутбук",
    "category_ids": ["phones", "laptops"],
    "allow_surcharge": true,
    "max_surcharge": 5000
  }
}
```

## Цель и экран «Обмены»

Эти эндпоинты покрывают экран: цель сверху, текущий товар, горизонтальный
список вариантов следующего обмена и история снизу.

| Метод | URL | Назначение |
| --- | --- | --- |
| `POST` | `/exchange-goals` | Начать путь к цели |
| `GET` | `/exchange-goals/{goalId}` | Получить состояние цели и маршрут |
| `GET` | `/exchange-goals/{goalId}/board` | Данные экрана «Обмены» одним запросом |
| `POST` | `/exchange-goals/{goalId}/recalculate` | Явно пересчитать рекомендации |
| `POST` | `/exchange-goals/{goalId}/stop` | Завершить путь без достижения цели |

`POST /exchange-goals`

```json
{
  "current_product_id": "bike-1",
  "target": {
    "product_id": "console-9",
    "name": "Игровая приставка",
    "category_id": "consoles"
  },
  "max_steps": 4
}
```

`GET /exchange-goals/{goalId}/board` возвращает не более одной активной стадии:

```json
{
  "goal": { "id": "goal-1", "status": "active", "target": { "name": "iPhone 15" } },
  "current_stage": {
    "step_id": "step-1",
    "current_product": { "id": "bike-1", "name": "Горный велосипед" },
    "suggestions": [
      {
        "product": { "id": "phone-7", "name": "iPhone 13", "owner": { "id": "u-2", "rating": 4.9 } },
        "route_preview": ["bike-1", "phone-7", "iphone-15"],
        "match_score": 0.92,
        "offer_status": null
      }
    ]
  },
  "history": [
    {
      "exchange_id": "ex-4",
      "given_product": { "id": "scooter-2", "name": "Самокат" },
      "received_product": { "id": "bike-1", "name": "Горный велосипед" },
      "completed_at": "2026-08-07T10:20:00Z"
    }
  ]
}
```

`suggestions` - кандидаты для **одного ближайшего шага**, а не обязательства
всех владельцев по `route_preview`. Можно отправить предложения нескольким
кандидатам одновременно.

## Предложения и завершение обмена

| Метод | URL | Назначение |
| --- | --- | --- |
| `POST` | `/exchange-offers` | Отправить предложение одному владельцу |
| `GET` | `/exchange-offers?role=incoming&status=pending` | Входящие/исходящие предложения |
| `GET` | `/exchange-offers/{offerId}` | Детали, чат и состояние |
| `POST` | `/exchange-offers/{offerId}/accept` | Принять предложение |
| `POST` | `/exchange-offers/{offerId}/decline` | Отклонить предложение |
| `POST` | `/exchange-offers/{offerId}/cancel` | Отозвать своё предложение |
| `POST` | `/exchanges/{exchangeId}/confirm` | Подтвердить результат обмена |

`POST /exchange-offers`

```json
{
  "offered_product_id": "bike-1",
  "requested_product_id": "phone-7",
  "exchange_goal_id": "goal-1",
  "route_step_id": "step-1",
  "surcharge": { "amount": 0, "currency": "RUB", "payer": null },
  "comment": "Готов встретиться в выходные"
}
```

Поле `exchange_goal_id` необязательно: оно связывает предложение с экраном
«Обмены». Без него это обычный прямой обмен. Сервер проверяет, что оба товара
активны, принадлежат разным пользователям и инициатор владеет `offered_product_id`.

Ответ на создание (201):

```json
{
  "id": "offer-10",
  "status": "pending",
  "conversation_id": "chat-44",
  "expires_at": "2026-08-10T12:00:00Z"
}
```

`POST /exchange-offers/{offerId}/accept` создаёт `exchange` со статусом
`awaiting_initiator`. Принятие не меняет владение товарами. Обе стороны затем
вызывают `POST /exchanges/{exchangeId}/confirm`:

```json
{ "result": "success" }
```

или

```json
{ "result": "failed", "reason": "Не договорились о встрече" }
```

При первом `success` сервер сохраняет подтверждение и ждёт второго. При втором
атомарно завершает обмен, закрывает конкурирующие pending-офферы для тех же
товаров, обновляет цель и возвращает `goal_id` с новым состоянием.

## Чат, отзывы и уведомления

| Метод | URL | Назначение |
| --- | --- | --- |
| `GET`, `POST` | `/conversations/{conversationId}/messages` | Чтение и отправка сообщений |
| `POST` | `/exchanges/{exchangeId}/reviews` | Отзыв после `completed` |
| `GET` | `/notifications?unread=true` | Предложения, ответы и сообщения |
| `POST` | `/notifications/{notificationId}/read` | Отметить уведомление прочитанным |

Отзыв разрешён только участнику завершённого обмена и только один раз на
контрагента в рамках `exchangeId`.

## Правила конкурентности

1. При `accept` и финальном `confirm` блокируйте строки обоих товаров в одной
   транзакции (`SELECT ... FOR UPDATE`).
2. Повторный запрос должен быть идемпотентным: клиент передаёт `Idempotency-Key`
   для `POST /exchange-offers` и `/confirm`.
3. После отказа пересчитывайте маршрут цели, но не отменяйте остальные
   `pending`-предложения пользователя.
4. Если товар стал недоступен, помечайте соответствующую рекомендацию
   `outdated`, формируйте новые кандидаты и возвращайте их через `board`.

