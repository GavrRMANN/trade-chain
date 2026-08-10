# Цепочка обменов товарами

Проект сервиса обмена товарами: backend на Go, PostgreSQL и frontend на React + TypeScript. Пользователь публикует товар, выбирает желаемые категории, находит подходящие цепочки обмена и договаривается с другими участниками.

В README описаны запуск и проверка всего проекта. Фронтенд находится в `front/`, backend — в `back/`, а общий запуск описан в `docker-compose.yml`.

## Оглавление

- [Требования](#требования)
- [Запуск](#запуск)
  - [Вариант 1. Полный стек через Docker Compose](#вариант-1-полный-стек-через-docker-compose)
  - [Вариант 2. Только фронтенд с mock API без Docker](#вариант-2-только-фронтенд-с-mock-api-без-docker)
- [Команды разработки](#команды-разработки)
- [Основные пользовательские сценарии](#основные-пользовательские-сценарии)
- [API](#api)
  - [Авторизация](#авторизация)
  - [Товары и категории](#товары-и-категории)
  - [Пользователи, отзывы и wishlist](#пользователи-отзывы-и-wishlist)
  - [Обмен и цепочки](#обмен-и-цепочки)
- [Архитектура и ключевые решения](#архитектура-и-ключевые-решения)
- [Ограничения MVP](#ограничения-mvp)
- [Быстрая проверка после запуска](#быстрая-проверка-после-запуска)
- [Полезные адреса](#полезные-адреса)

## Требования

- Go, версия согласно `back/go.mod`
- Node.js 20 или новее
- npm 10 или новее
- Docker и Docker Compose для полного запуска проекта

Версии зависимостей зафиксированы в `front/package-lock.json`. Для установки используйте `npm ci`, а не `npm install`.

## Запуск

### Вариант 1. Полный стек через Docker Compose

Команду нужно выполнять из корня репозитория:

```bash
docker compose up --build
```

После запуска:

- фронтенд: http://localhost:3000
- API: http://localhost:8080
- healthcheck API: http://localhost:8080/health
- Swagger API: http://localhost:8080/swagger/index.html
- PostgreSQL: localhost:5432

Остановить сервисы:

```bash
docker compose down
```

Полностью пересоздать локальную базу вместе с данными:

```bash
docker compose down -v
docker compose up --build
```

Этот вариант запускает реальный backend, PostgreSQL и собранный frontend. При первом создании тома база инициализируется миграциями, включая тестовые данные. Это основной вариант для проверки проекта целиком.

### Вариант 2. Только фронтенд с mock API без Docker

В первом терминале:

```bash
cd front
npm ci
PORT=3001 npm run mock-api
```

Во втором терминале:

```bash
cd front
VITE_API_BASE_URL=http://localhost:3001 npm run dev
```

Открыть http://localhost:5173.

Важно: `mock-api` по умолчанию слушает порт `3001`, а локальный `front/.env` фронтенда указывает на `http://localhost:8080`. Поэтому при запуске mock API переменную `VITE_API_BASE_URL` нужно передать явно, как в команде выше.

Проверить mock API:

```bash
curl http://localhost:3001/health
```

Ожидаемый ответ:

```json
{ "status": "ok" }
```

Mock API хранит изменения только в памяти процесса. После перезапуска сервера созданные пользователи, товары, предложения и сообщения возвращаются к исходным данным из `front/mock-api/data.js`.

## Команды разработки

Команды frontend выполняются из `front`:

```bash
npm run dev              # dev-сервер Vite
npm run build            # проверка TypeScript и production-сборка
npm run preview          # локальный просмотр dist после build
npm run lint             # ESLint
npm run lint:fix         # ESLint с автоматическим исправлением
npm run test             # Vitest в однократном режиме
npm run test:watch       # Vitest в watch-режиме
npm run storybook        # Storybook на http://localhost:6006
npm run build-storybook # production-сборка Storybook
npm run format:check     # проверка Prettier
npm run format           # форматирование файлов
```

Основные команды backend выполняются из `back`:

```bash
go test ./...            # тесты backend
go build ./...           # проверка сборки backend
```

Для запуска backend вместе с PostgreSQL используйте Docker Compose из корня репозитория. Отдельный локальный запуск backend требует доступного PostgreSQL и настроек окружения из backend-конфигурации.

Минимальная проверка перед сдачей:

```bash
cd front
npm ci
npm run lint
npm run test
npm run build
npm run format:check
```

## Основные пользовательские страницы

1. **Каталог и поиск**
   - Открыть `/`.
   - Искать товары по строке, категории и подкатегории.
   - Открыть карточку товара по адресу `/product/:productId`.
   - Посмотреть рекомендации для товара.

2. **Регистрация и вход**
   - Открыть модальное окно авторизации через `/auth` или попытаться открыть защищенный раздел.
   - Зарегистрировать пользователя или войти существующим аккаунтом.
   - После входа приложение возвращает пользователя на исходный защищенный маршрут.

   Backend создает эти тестовые аккаунты миграцией `back/infrastructure/migrations/006_seed_mock_data.sql`. Для всех используется пароль `password123`:

   | Email                 | Пароль        |
   | --------------------- | ------------- |
   | `alexey@example.com`  | `password123` |
   | `maria@example.com`   | `password123` |
   | `ivan@example.com`    | `password123` |
   | `olga@example.com`    | `password123` |
   | `dmitry@example.com`  | `password123` |
   | `elena@example.com`   | `password123` |
   | `sergey@example.com`  | `password123` |
   | `natalia@example.com` | `password123` |
   | `pavel@example.com`   | `password123` |
   | `irina@example.com`   | `password123` |
   | `roman@example.com`   | `password123` |

   Миграция выполняется при первом создании PostgreSQL-тома. Если база уже была создана раньше, для повторного заполнения тестовыми данными пересоздайте том:

   ```bash
   docker compose down -v
   docker compose up --build
   ```

3. **Профиль**
   - Открыть `/profile`.
   - Изменить данные профиля.
   - Посмотреть свои товары, рейтинг и отзывы.
   - Открыть публичный профиль по адресу `/profile/:customerId`.

4. **Товар**
   - Создать товар через `/create`.
   - Отредактировать свой товар через `/product/:productId/edit`.
   - Архивировать товар из профиля или карточки.

5. **Желаемый обмен**
   - Создать wishlist для товара.
   - Добавить или удалить категории, которые пользователь готов рассматривать в обмен.

6. **Цепочка обмена**
   - Открыть предложение обмена из карточки товара.
   - Выбрать свой товар и создать цепочку.
   - Открыть `/exchanges` со списком активных и завершенных цепочек.
   - Перейти в `/exchanges/:chainId`, читать и отправлять сообщения.
   - Изменять статус цепочки и подтверждать обмен.

7. **Маршрут обмена**
   - Открыть `/route`.
   - Выбрать исходный товар и цель обмена.
   - Получить рекомендации и подходящие цепочки через поиск `/search/chain`.

8. **Уведомления**
   - Открыть `/notifications`.
   - Проверить события, собранные по своим цепочкам и товарам.

## API

Frontend обращается к backend через REST API и добавляет к базовому URL суффикс `/api/v1`. Базовый URL задается через `VITE_API_BASE_URL`:

```text
VITE_API_BASE_URL=http://localhost:8080
```

Авторизованные запросы получают токен из `localStorage` и отправляют его как `Authorization: Bearer <token>`.

### Авторизация

```text
POST /api/v1/auth/login
POST /api/v1/auth/register
GET  /api/v1/auth/me
```

### Товары и категории

```text
GET   /api/v1/products
GET   /api/v1/products/:id
GET   /api/v1/products/by-customer/:customerId
GET   /api/v1/products/:id/recommendations
POST  /api/v1/products
PATCH /api/v1/products/:id
POST  /api/v1/products/:id/archive

GET    /api/v1/categories
GET    /api/v1/categories/:id
GET    /api/v1/categories/:id/subcategories
POST   /api/v1/categories
PATCH  /api/v1/categories/:id
DELETE /api/v1/categories/:id
```

### Пользователи, отзывы и wishlist

```text
GET    /api/v1/customers
GET    /api/v1/customers/:id
PATCH  /api/v1/customers/:id
DELETE /api/v1/customers/:id

POST   /api/v1/reviews
GET    /api/v1/reviews/:id
GET    /api/v1/reviews/by-customer/:customerId
GET    /api/v1/reviews/by-customer/:customerId/rating
DELETE /api/v1/reviews/:id

POST   /api/v1/wishlists
GET    /api/v1/wishlists/:id
GET    /api/v1/wishlists/by-product/:productId
DELETE /api/v1/wishlists/:id
GET    /api/v1/wishlists/:id/options
POST   /api/v1/wishlists/:id/options
DELETE /api/v1/wishlists/:id/options/:categoryId
```

### Обмен и цепочки

```text
POST   /api/v1/chains
GET    /api/v1/chains/:id
GET    /api/v1/chains/:id/full
GET    /api/v1/chains/by-product/:productId
GET    /api/v1/chains/my
PATCH  /api/v1/chains/:id/status
POST   /api/v1/chains/:id/confirm
DELETE /api/v1/chains/:id
GET    /api/v1/chains/:id/messages
POST   /api/v1/chains/:id/messages

GET    /api/v1/exchange-offers/:id
GET    /api/v1/exchanges
GET    /api/v1/search/chain
```

Точные тела запросов и типы ответов frontend находятся рядом с API-клиентами в `front/src/entities/*/api` и `front/src/entities/*/types`. Реализация endpoint’ов находится в backend, а полный контракт доступен в Swagger после запуска API.

## Архитектура и ключевые решения

- Backend на Go предоставляет REST API, бизнес-логику обменов и работу с PostgreSQL.
- React 19 + TypeScript + Vite используются для frontend-клиента.
- Redux Toolkit используется для глобального состояния и RTK Query для запросов к API.
- React Router разделяет публичные и защищенные маршруты. Авторизация открывается модальным маршрутом поверх каталога, поэтому пользователь не теряет текущий контекст.
- Код frontend организован по слоям `app`, `pages`, `widgets`, `features`, `entities`, `shared`.
- Стили компонентов изолированы через CSS Modules.
- Все запросы проходят через единый `fetchBaseQuery`; токен добавляется централизованно.
- API-модули frontend разделены по доменам: пользователь, товар, категория, wishlist, отзыв, цепочка и поиск.
- Часть страниц загружается лениво (`exchangeRoom`, `route`, `notifications`, авторизация и 404), чтобы не включать весь код в стартовый bundle.
- Vercel раздает frontend как SPA через fallback на `front/index.html`, а `/api/v1`, `/health` и `/swagger` проксирует на backend.

## Ограничения MVP

- Нет полноценной production-аутентификации: безопасность токенов и управление сессиями зависят от backend.
- Mock API не использует базу данных и не сохраняет изменения между перезапусками.
- Mock API предназначен для локальной проверки UI и основных контрактов, а не для нагрузочного или security-тестирования.
- В интерфейсе нет полноценной платежной части, доставки, арбитража и сложного управления сделкой.
- Уведомления формируются из доступных данных о цепочках и товарах; отдельного realtime-канала нет.
- Загрузка изображений и хранение файлов не вынесены в отдельное production-хранилище.
- Набор тестов покрывает отдельные функции и компоненты, но не заменяет end-to-end проверку пользовательских сценариев.
- Роли и права доступа ограничены текущими сценариями MVP.
- Для самостоятельного запуска фронтенда нужен доступный API. Если `VITE_API_BASE_URL` указывает на недоступный адрес, каталог и авторизация будут показывать ошибки запросов.

## Быстрая проверка после запуска

1. Открыть каталог и убедиться, что список товаров загрузился.
2. Открыть товар и проверить рекомендации.
3. Войти через тестовый аккаунт `alexey@example.com` / `password123`.
4. Открыть профиль и список обменов.
5. Создать или открыть товар, перейти к предложению обмена.
6. В комнате обмена отправить сообщение и проверить изменение списка сообщений.
7. Открыть `/notifications` и проверить наличие связанных событий.
8. Открыть DevTools, вкладку Network, и убедиться, что запросы уходят на ожидаемый `VITE_API_BASE_URL`.

## Полезные адреса

| Назначение          | Адрес                                    |
| ------------------- | ---------------------------------------- |
| Vite dev server     | http://localhost:5173                    |
| Docker frontend     | http://localhost:3000                    |
| Mock API            | http://localhost:3001                    |
| Backend API         | http://localhost:8080                    |
| Backend healthcheck | http://localhost:8080/health             |
| Swagger             | http://localhost:8080/swagger/index.html |
| Storybook           | http://localhost:6006                    |
