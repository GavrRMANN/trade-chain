# API бекенда

Документ описывает текущую реализацию HTTP API в `../../back/internal/httpapi`.

## Общие сведения

- Базовый путь прикладных маршрутов: `/api/v1`.
- Идентификаторы ресурсов — UUID в виде строк.
- Формат тела запросов и ответов — JSON.
- Даты возвращаются в формате ISO 8601.
- Для маршрутов с JWT используется заголовок `Authorization: Bearer <token>`.
- Пагинация списка товаров и пользователей: `offset` (по умолчанию `0`) и
  `limit` (по умолчанию `20`).

Сервис также предоставляет:

- `GET /health` — проверка состояния, ответ `{ "status": "ok" }`;
- `GET /swagger/*` — Swagger UI;
- `GET /swagger/doc.json` — OpenAPI-описание, сгенерированное из аннотаций.

## Авторизация

### `POST /api/v1/auth/register`

Регистрация пользователя. Возвращает созданного пользователя и JWT.

```json
{
  "email": "anna@example.com",
  "password": "secret123"
}
```

Ответ `201`:

```json
{
  "user": {
    "customer_id": "user-1",
    "email": "anna@example.com",
    "created_at": "2026-08-08T10:00:00Z",
    "updated_at": "2026-08-08T10:00:00Z"
  },
  "token": "<jwt>"
}
```

### `POST /api/v1/auth/login`

Вход по email и паролю. Формат запроса такой же, как у регистрации. Ответ
`200` имеет формат `AuthResponse`, приведённый выше.

### `GET /api/v1/auth/me`

Возвращает текущего пользователя (`Customer`). Маршрут защищён
`AuthMiddleware` и требует заголовок `Authorization: Bearer <token>`.

## Модель пользователя

### `GET /api/v1/customers`

Список пользователей. Поддерживает `offset` и `limit`.

### `GET /api/v1/customers/{id}`

Получение пользователя по ID.

### `PATCH /api/v1/customers/{id}`

Частичное изменение пользователя:

```json
{
  "email": "new@example.com",
  "password": "newsecret123"
}
```

### `DELETE /api/v1/customers/{id}`

Удаление пользователя. Ответ `204` без тела.

Отдельный `POST /api/v1/customers` в текущем роутере не подключён; для
регистрации используется `/auth/register`.

## Товары

### `GET /api/v1/products`

Каталог товаров. Параметры запроса:

- `q` — текстовый поиск;
- `category_id` — фильтр по категории;
- `offset`, `limit` — пагинация.

При наличии `q` или `category_id` сначала выполняется поиск, затем к нему
применяется пагинация.

### `GET /api/v1/products/{id}`

Получение товара по ID.

### `POST /api/v1/products`

Создание товара. Требует JWT. Поля запроса соответствуют `CreateProductDTO`:

```json
{
  "customer_id": "user-1",
  "category_id": "category-1",
  "title": "Горный велосипед",
  "description": "Размер M, исправен",
  "image": "https://example.com/bike.jpg",
  "price": 50000,
  "location": "Москва",
  "status": "active"
}
```

`customer_id`, `title` обязательны. `status` можно не передавать.

### `PATCH /api/v1/products/{id}`

Изменение товара. Требует JWT. Все поля опциональны:

```json
{
  "title": "Новое название",
  "description": "Обновлённое описание",
  "category_id": "category-2",
  "image": "https://example.com/new.jpg",
  "price": 45000,
  "location": "Москва",
  "status": "archived"
}
```

### `GET /api/v1/products/search`

Отдельный поиск товаров. Параметр `q` обязателен, `category_id` опционален.
Ответ — массив `Product`.

### `GET /api/v1/products/by-customer/{customerID}`

Все товары пользователя.

Дополнительные маршруты авторизованного владельца:

| Метод  | Маршрут                                        | Назначение                         |
| ------ | ---------------------------------------------- | ---------------------------------- |
| `GET`  | `/api/v1/products/mine`                        | Собственные объявления             |
| `POST` | `/api/v1/products/{productID}/image`           | Загрузка одного изображения        |
| `POST` | `/api/v1/products/{productID}/archive`         | Архивирование объявления           |
| `PUT`  | `/api/v1/products/{productID}/wishlist`        | Замена пожеланий к товару          |
| `GET`  | `/api/v1/products/{productID}/recommendations` | Подходящие варианты прямого обмена |

Статусы товара: `active`, `reserved`, `exchanged`, `archived`.

## Категории

| Метод    | Маршрут                                 | Результат                   |
| -------- | --------------------------------------- | --------------------------- |
| `GET`    | `/api/v1/categories`                    | Список категорий            |
| `POST`   | `/api/v1/categories`                    | Создание категории, `201`   |
| `GET`    | `/api/v1/categories/{id}`               | Категория по ID             |
| `PUT`    | `/api/v1/categories/{id}`               | Полное обновление категории |
| `DELETE` | `/api/v1/categories/{id}`               | Удаление, `204`             |
| `GET`    | `/api/v1/categories/{id}/subcategories` | Дочерние категории          |

Модель категории:

```json
{
  "category_id": "category-1",
  "name": "Электроника",
  "parent_id": null,
  "created_at": "2026-08-08T10:00:00Z",
  "updated_at": "2026-08-08T10:00:00Z"
}
```

## Wishlist

| Метод    | Маршрут                                       | Результат                   |
| -------- | --------------------------------------------- | --------------------------- |
| `POST`   | `/api/v1/wishlists`                           | Создание wishlist, `201`    |
| `GET`    | `/api/v1/wishlists/{id}`                      | Wishlist по ID              |
| `DELETE` | `/api/v1/wishlists/{id}`                      | Удаление, `204`             |
| `GET`    | `/api/v1/wishlists/by-product/{productID}`    | Wishlist товара             |
| `GET`    | `/api/v1/wishlists/{id}/options`              | Категории-желания           |
| `POST`   | `/api/v1/wishlists/{id}/options`              | Добавление категории, `204` |
| `DELETE` | `/api/v1/wishlists/{id}/options/{categoryID}` | Удаление категории, `204`   |

Создание wishlist принимает `product_id` и `name`:

```json
{
  "product_id": "product-1",
  "name": "Смартфон или ноутбук"
}
```

Добавление категории в options:

```json
{
  "category_id": "category-1"
}
```

## Цепочки обмена

Предложение и сделка — это одно звено `Chain`. Маршруты `/chains/*` работают
с ним напрямую и остаются для существующего фронта; поверх них живут
`/exchange-offers` и `/exchanges` (см. ниже), которые говорят на языке
предложений. Отдельных ресурсов `exchange-goals` и `conversations` пока нет.

| Метод    | Маршрут                                 | Результат                     |
| -------- | --------------------------------------- | ----------------------------- |
| `POST`   | `/api/v1/chains`                        | Создание цепочки, `201`       |
| `GET`    | `/api/v1/chains/my`                     | Цепочки текущего пользователя |
| `GET`    | `/api/v1/chains/{id}`                   | Цепочка по ID                 |
| `GET`    | `/api/v1/chains/{id}/full`              | Все связанные звенья          |
| `GET`    | `/api/v1/chains/by-product/{productID}` | Цепочки товара                |
| `PATCH`  | `/api/v1/chains/{id}/status`            | Изменение статуса, `204`      |
| `POST`   | `/api/v1/chains/{id}/confirm`           | Подтверждение результата      |
| `DELETE` | `/api/v1/chains/{id}`                   | Удаление, `204`               |
| `GET`    | `/api/v1/chains/{id}/messages`          | Сообщения цепочки             |
| `POST`   | `/api/v1/chains/{id}/messages`          | Новое сообщение, `201`        |

Модель `Chain`:

```json
{
  "chain_id": "chain-1",
  "from_product_id": "product-1",
  "to_product_id": "product-2",
  "initiator_id": "user-1",
  "recipient_id": "user-2",
  "previous_chain_id": null,
  "next_chain_id": null,
  "status": "pending",
  "message": "Готов обменяться",
  "expires_at": "2026-08-15T10:00:00Z",
  "created_at": "2026-08-08T10:00:00Z",
  "updated_at": "2026-08-08T10:00:00Z"
}
```

При `POST /chains` поле `initiator_id` перезаписывается значением из JWT.
Для подтверждения используется:

```json
{ "success": true }
```

Для `PATCH /chains/{id}/status`:

```json
{ "status": "active" }
```

Поддерживаемые статусы: `pending`, `active`, `completed`, `cancelled`,
`rejected`, `countered`, `failed`, `expired`.

### Сообщения

`POST /api/v1/chains/{id}/messages` принимает:

```json
{ "body": "Готов встретиться в выходные" }
```

Сообщение возвращается с полями `message_id`, `chain_id`, `customer_id`,
`body` и `created_at`.

## Предложения и завершение обмена

Маршруты из плана API поверх той же таблицы `chains`: отдельных сущностей
`exchange_offer` и `exchange` в базе нет. Идентификатор предложения, обмена и
переписки — это `chain_id`, поэтому `offerId`, `exchangeId` и
`conversation_id` совпадают.

Вся группа закрыта `AuthMiddleware`: без заголовка `Authorization` ответ `401`.

| Метод  | Маршрут                                     | Результат                    |
| ------ | ------------------------------------------- | ---------------------------- |
| `POST` | `/api/v1/exchange-offers`                   | Отправить предложение, `201` |
| `GET`  | `/api/v1/exchange-offers?role=&status=`     | Входящие и исходящие         |
| `GET`  | `/api/v1/exchange-offers/{offerID}`         | Детали, чат и состояние      |
| `POST` | `/api/v1/exchange-offers/{offerID}/accept`  | Принять                      |
| `POST` | `/api/v1/exchange-offers/{offerID}/decline` | Отклонить                    |
| `POST` | `/api/v1/exchange-offers/{offerID}/cancel`  | Отозвать своё                |
| `POST` | `/api/v1/exchanges/{exchangeID}/confirm`    | Подтвердить результат        |

`POST /api/v1/exchange-offers`:

```json
{
  "offered_product_id": "product-1",
  "requested_product_id": "product-2",
  "exchange_goal_id": null,
  "route_step_id": null,
  "surcharge": { "amount": 0, "currency": "RUB", "payer": null },
  "comment": "Готов встретиться в выходные"
}
```

Инициатор берётся из токена. Сервер проверяет, что оба товара активны,
принадлежат разным людям и инициатор владеет `offered_product_id`. Доплата
принимается только вместе с плательщиком — одной из сторон обмена; нулевая
сумма с указанным плательщиком отклоняется. `comment` хранится в поле
`message` звена.

Ответ `201`:

```json
{
  "id": "chain-1",
  "status": "pending",
  "conversation_id": "chain-1",
  "expires_at": "2026-08-11T12:00:00Z"
}
```

Повторное предложение по той же паре товаров, пока предыдущее ждёт ответа,
отклоняется с `409`: уникальный частичный индекс не даёт создать близнеца.
После отказа или отмены предложить снова можно.

### Статусы

Статусы предложения и обмена — это разные взгляды на статус звена:

| `chain.status`          | `offer.status` | `exchange.status`                           |
| ----------------------- | -------------- | ------------------------------------------- |
| `pending`               | `pending`      | —                                           |
| `active`                | `accepted`     | `awaiting_initiator` / `awaiting_recipient` |
| `completed`             | `completed`    | `completed`                                 |
| `failed`                | `failed`       | `failed`                                    |
| `rejected`, `countered` | `declined`     | —                                           |
| `cancelled`             | `cancelled`    | —                                           |
| `expired`               | `expired`      | —                                           |

Два отличия от плана API. Первое: `offer.status` умеет `failed` — обмен по
принятому предложению может не состояться, и прятать это под `completed`
значило бы показать успешную сделку там, где её не было. Второе: истёкший срок
проставляется на чтении, поэтому предложение с прошедшим `expires_at` приходит
как `expired`, хотя в базе оно всё ещё `pending`.

`GET /api/v1/exchange-offers` принимает `role` (`incoming`, `outgoing` или
пусто) и `status` — одним значением, через запятую или повторяющимся
параметром. Неизвестное значение даёт `400`, а не молча урезанный список.

### Подтверждение результата

```json
{ "result": "success" }
```

или

```json
{ "result": "failed", "reason": "Не договорились о встрече" }
```

При первом `success` сервер сохраняет подтверждение и ждёт второго. При втором
в одной транзакции меняет владельцев товаров, закрывает конкурирующие
предложения по этим вещам (они переходят в `cancelled`) и завершает звено.
Для `failed` достаточно одной стороны: тот, кто приехал впустую, не должен
зависеть от согласия второй. Причина сохраняется только при `failed`.

Ответ:

```json
{
  "id": "chain-1",
  "status": "awaiting_recipient",
  "offer_status": "accepted",
  "offered_product_id": "product-1",
  "requested_product_id": "product-2",
  "goal_id": null
}
```

`exchange_goal_id` и `route_step_id` возвращаются теми же, что были указаны
при создании предложения. Они связывают сделку с общей целью и текущим шагом
маршрута пользователя.

Чего в этой части ещё нет: заголовок `Idempotency-Key` не поддерживается —
от дублей защищает уникальный индекс. После успешного подтверждения товары
меняют владельцев и получают статус `exchanged`.

## Поиск цепочки

### `GET /api/v1/search/chain`

Находит путь от товаров текущего пользователя до целевого товара.

Параметры:

- `target_product_id` — обязательный ID целевого товара;
- `max_depth` — максимальная глубина, по умолчанию `10`, должна быть больше `0`.

Ответ:

```json
{
  "chain": [],
  "length": 0
}
```

### `GET /api/v1/search/candidates`

Подбирает следующий обмен для товара текущего пользователя. Требует JWT.

- `product_id` — обязательный ID стартового товара;
- `limit` — максимальное число кандидатов, по умолчанию `8`;
- `direct=true` — вернуть только прямые совпадения по wishlist, без добора из каталога.

## Уведомления и realtime

Все маршруты требуют JWT:

| Метод | Маршрут                                | Назначение                                    |
| ----- | -------------------------------------- | --------------------------------------------- |
| `GET` | `/api/v1/events`                       | SSE-подписка на сообщения и изменения обменов |
| `GET` | `/api/v1/notifications/read-statuses`  | Состояния прочтения                           |
| `PUT` | `/api/v1/notifications/{chainID}/read` | Отметить событие обмена прочитанным           |
| `PUT` | `/api/v1/notifications/read-all`       | Отметить все события прочитанными             |

## Отзывы

| Метод    | Маршрут                                           | Результат              |
| -------- | ------------------------------------------------- | ---------------------- |
| `POST`   | `/api/v1/reviews`                                 | Создание отзыва, `201` |
| `GET`    | `/api/v1/reviews/{id}`                            | Отзыв по ID            |
| `DELETE` | `/api/v1/reviews/{id}`                            | Удаление, `204`        |
| `GET`    | `/api/v1/reviews/by-customer/{customerID}`        | Отзывы пользователя    |
| `GET`    | `/api/v1/reviews/by-customer/{customerID}/rating` | Средний рейтинг        |

Создание отзыва:

```json
{
  "chain_id": "chain-1",
  "rating": 5,
  "comment": "Всё прошло отлично",
  "product_id": "product-2"
}
```

`from_customer_id` берётся из JWT и не передаётся клиентом. `product_id` можно
не указывать. Ответ рейтинга имеет вид `{ "average_rating": 4.5 }`.

## Ошибки

Обработчики возвращают единый формат:

```json
{
  "error": "resource not found"
}
```

Основные соответствия:

| HTTP  | Сообщение сервиса                            |
| ----- | -------------------------------------------- |
| `400` | `invalid input`                              |
| `403` | `operation forbidden`                        |
| `404` | `resource not found`                         |
| `409` | `resource conflict`                          |
| `500` | `internal error` или текст внутренней ошибки |

Ошибки отсутствующего или некорректного JWT формируются middleware напрямую
как текстовый HTTP-ответ со статусом `401`, а не как JSON `ErrorResponse`.

## Текущее подключение JWT

`AuthMiddleware` установлен на маршруты текущей сессии, изменения товаров,
цепочки и предложения обмена, поиск персонального маршрута, уведомления и
SSE-подписку. Публичными остаются каталог, категории и чтение общедоступных
профилей. Если защищённый маршрут вызван без корректного Bearer JWT, API
возвращает `401`.
