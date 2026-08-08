# API бекенда

Документ описывает текущую реализацию HTTP API в `back/internal/httpapi`.

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

Возвращает текущего пользователя (`Customer`). В штатном HTTP-потоке маршрут
сейчас не подключён к `AuthMiddleware`; без user ID в контексте обработчик
возвращает `403`.

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

В текущем роутере не подключены `DELETE /products/{id}`, архивирование,
wishlist товара и рекомендации товара, хотя обработчики этих операций могут
присутствовать в исходном коде.

Статусы товара: `active`, `reserved`, `exchanged`, `archived`.

## Категории

| Метод | Маршрут | Результат |
| --- | --- | --- |
| `GET` | `/api/v1/categories` | Список категорий |
| `POST` | `/api/v1/categories` | Создание категории, `201` |
| `GET` | `/api/v1/categories/{id}` | Категория по ID |
| `PUT` | `/api/v1/categories/{id}` | Полное обновление категории |
| `DELETE` | `/api/v1/categories/{id}` | Удаление, `204` |
| `GET` | `/api/v1/categories/{id}/subcategories` | Дочерние категории |

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

| Метод | Маршрут | Результат |
| --- | --- | --- |
| `POST` | `/api/v1/wishlists` | Создание wishlist, `201` |
| `GET` | `/api/v1/wishlists/{id}` | Wishlist по ID |
| `DELETE` | `/api/v1/wishlists/{id}` | Удаление, `204` |
| `GET` | `/api/v1/wishlists/by-product/{productID}` | Wishlist товара |
| `GET` | `/api/v1/wishlists/{id}/options` | Категории-желания |
| `POST` | `/api/v1/wishlists/{id}/options` | Добавление категории, `204` |
| `DELETE` | `/api/v1/wishlists/{id}/options/{categoryID}` | Удаление категории, `204` |

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

В текущей реализации предложение и сделка представлены сущностью `Chain`.
Отдельных ресурсов `exchange-goals`, `exchange-offers`, `exchanges` и
`conversations` нет.

| Метод | Маршрут | Результат |
| --- | --- | --- |
| `POST` | `/api/v1/chains` | Создание цепочки, `201` |
| `GET` | `/api/v1/chains/my` | Цепочки текущего пользователя |
| `GET` | `/api/v1/chains/{id}` | Цепочка по ID |
| `GET` | `/api/v1/chains/{id}/full` | Все связанные звенья |
| `GET` | `/api/v1/chains/by-product/{productID}` | Цепочки товара |
| `PATCH` | `/api/v1/chains/{id}/status` | Изменение статуса, `204` |
| `POST` | `/api/v1/chains/{id}/confirm` | Подтверждение результата |
| `DELETE` | `/api/v1/chains/{id}` | Удаление, `204` |
| `GET` | `/api/v1/chains/{id}/messages` | Сообщения цепочки |
| `POST` | `/api/v1/chains/{id}/messages` | Новое сообщение, `201` |

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

## Отзывы

| Метод | Маршрут | Результат |
| --- | --- | --- |
| `POST` | `/api/v1/reviews` | Создание отзыва, `201` |
| `GET` | `/api/v1/reviews/{id}` | Отзыв по ID |
| `DELETE` | `/api/v1/reviews/{id}` | Удаление, `204` |
| `GET` | `/api/v1/reviews/by-customer/{customerID}` | Отзывы пользователя |
| `GET` | `/api/v1/reviews/by-customer/{customerID}/rating` | Средний рейтинг |

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

| HTTP | Сообщение сервиса |
| --- | --- |
| `400` | `invalid input` |
| `403` | `operation forbidden` |
| `404` | `resource not found` |
| `409` | `resource conflict` |
| `500` | `internal error` или текст внутренней ошибки |

Ошибки отсутствующего или некорректного JWT формируются middleware напрямую
как текстовый HTTP-ответ со статусом `401`, а не как JSON `ErrorResponse`.

## Текущее подключение JWT

`AuthMiddleware` явно установлен только на `POST /products` и
`PATCH /products/{productID}`. Остальные обработчики, которым нужен user ID,
проверяют контекст самостоятельно, однако общий middleware в роутере пока
закомментирован. Поэтому для полного включения авторизации нужно подключить
`r.Use(auth.AuthMiddleware)` к защищённой группе в `router.go` и убрать
дублирующую локальную установку middleware с товарных маршрутов.
