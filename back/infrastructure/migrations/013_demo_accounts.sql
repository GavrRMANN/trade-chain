-- Пять демонстрационных профилей с подготовленным состоянием.
--
-- Каждый профиль отвечает за один проверяемый сценарий: пустой аккаунт,
-- поиск цели, ответ на входящее предложение, продолжение маршрута и история
-- с отказом. Без такой подготовки жюри видит один и тот же полупустой
-- каталог и не может пройти сценарий целиком.
--
-- Миграция дополняет 006_seed_mock_data.sql, а не заменяет его, и безопасна
-- к повторному запуску: тот же прогон приводит данные к тому же состоянию.

BEGIN;

-- ---------- Имена профилей ----------
--
-- Роль должна читаться прямо на экране выбора аккаунта, поэтому она попадает
-- в full_name: отдельного поля под демо-роль в модели покупателя нет.

UPDATE customers SET full_name = 'Роман · Новый пользователь'
WHERE customer_id = '2db05252-81a6-5e50-b52f-57a19da8baa7';

UPDATE customers SET full_name = 'Павел · Искатель'
WHERE customer_id = '1a9b30df-8e74-53f8-a55d-0c8a016995be';

UPDATE customers SET full_name = 'Мария · Получатель'
WHERE customer_id = '549fe311-ecdd-5f4e-9c1d-cea2d100e286';

UPDATE customers SET full_name = 'Дмитрий · В пути'
WHERE customer_id = '5e96d7bb-c76c-5558-881e-1b132e49d342';

UPDATE customers SET full_name = 'Сергей · Опытный участник'
WHERE customer_id = 'd3b90730-bf1f-5c12-95c7-b1ff3908167c';


-- ---------- Роль «Новый пользователь» ----------
--
-- Профиль должен быть пустым: сценарий проверяет добавление вещи из карточки
-- чужого товара. Единственное объявление уходит в архив, а не удаляется —
-- на него могут ссылаться внешние ключи.

UPDATE products
SET status = 'archived', updated_at = CURRENT_TIMESTAMP
WHERE product_id = 'cf28bf4e-36ae-5c96-8a61-113f6c9f2a3a';


-- ---------- Роль «Искатель» ----------
--
-- Нужны один-два активных товара и полное отсутствие обменов: сценарий
-- начинается с чистого поиска цели.

UPDATE products
SET status = 'active', updated_at = CURRENT_TIMESTAMP
WHERE product_id = 'cfc4896d-6ef9-594c-91ca-cf9a0248886b';

INSERT INTO products (
    product_id,
    customer_id,
    category_id,
    title,
    description,
    image,
    price,
    location,
    status,
    created_at,
    updated_at
) VALUES (
    'c1d0f5a2-4b6e-5a71-9c30-2f8ab7d41e55',
    '1a9b30df-8e74-53f8-a55d-0c8a016995be',
    '4a82b1a2-c73c-505e-91ba-e1cbc3b4ad25',
    'Видеокарта GTX 1650 4 ГБ',
    'Рабочая карта для нетребовательных игр. Готов обменять на игры для PS5 или доплатить.',
    'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80',
    9500,
    'Москва',
    'active',
    '2026-08-08T10:00:00Z',
    '2026-08-08T10:00:00Z'
) ON CONFLICT (product_id) DO NOTHING;


-- ---------- Роль «В пути» ----------
--
-- Завершённый шаг маршрута из сида описан несогласованно: инициатор отдаёт
-- товар, который числится за второй стороной. Приводим цепочку к тому, что
-- произошло на самом деле — Дмитрий отдал свою видеокарту и получил игру, —
-- иначе история пути читается задом наперёд.

UPDATE chains
SET from_product_id = 'b337b8f3-49cf-5e4d-ba3a-4ad424cf256f',
    to_product_id   = 'd4f45a72-f924-5fd5-98a1-6ab1ebcab104',
    -- Завершённый шаг привязывается к цели и к товару, который был на руках:
    -- без этих полей маршрут не соберётся и пройденный шаг потеряется.
    exchange_goal_id = '71aa4523-dca9-5f8e-9cb0-b448765d8c84',
    route_step_id    = 'b337b8f3-49cf-5e4d-ba3a-4ad424cf256f',
    updated_at = '2026-08-02T11:30:00Z'
WHERE chain_id = '8294f156-588c-5105-9113-2748be0be71a';

-- Владение после завершённого обмена: игра у Дмитрия, видеокарта у Сергея.
UPDATE products
SET customer_id = '5e96d7bb-c76c-5558-881e-1b132e49d342',
    status = 'active',
    updated_at = CURRENT_TIMESTAMP
WHERE product_id = 'd4f45a72-f924-5fd5-98a1-6ab1ebcab104';

UPDATE products
SET customer_id = 'd3b90730-bf1f-5c12-95c7-b1ff3908167c',
    status = 'active',
    updated_at = CURRENT_TIMESTAMP
WHERE product_id = 'b337b8f3-49cf-5e4d-ba3a-4ad424cf256f';

-- Активный следующий шаг к той же цели: маршрут продолжается, а не замер.
INSERT INTO chains (
    chain_id,
    from_product_id,
    to_product_id,
    initiator_id,
    recipient_id,
    previous_chain_id,
    exchange_goal_id,
    route_step_id,
    status,
    message,
    expires_at,
    created_at,
    updated_at
) VALUES (
    'a7c1e9b4-2f60-5d18-8e42-3c9d5b71fa20',
    'd4f45a72-f924-5fd5-98a1-6ab1ebcab104',
    '71aa4523-dca9-5f8e-9cb0-b448765d8c84',
    '5e96d7bb-c76c-5558-881e-1b132e49d342',
    '42bcc017-c6ef-5eb9-898f-6ff0d01293b2',
    '8294f156-588c-5105-9113-2748be0be71a',
    '71aa4523-dca9-5f8e-9cb0-b448765d8c84',
    'd4f45a72-f924-5fd5-98a1-6ab1ebcab104',
    'pending',
    'Второй шаг к Spider-Man 2: меняю Forza Horizon 5.',
    '2026-08-20T12:00:00Z',
    '2026-08-08T12:00:00Z',
    '2026-08-08T12:00:00Z'
) ON CONFLICT (chain_id) DO NOTHING;


-- ---------- Роль «Опытный участник» ----------
--
-- К уже имеющимся завершённому обмену и отзывам добавляется несостоявшийся:
-- сценарий показывает, что после отказа цель и история сохраняются.

INSERT INTO chains (
    chain_id,
    from_product_id,
    to_product_id,
    initiator_id,
    recipient_id,
    exchange_goal_id,
    route_step_id,
    status,
    message,
    expires_at,
    created_at,
    updated_at
) VALUES (
    'f3a86c25-9d47-5b0a-9f61-7e2d4c8b1093',
    'b337b8f3-49cf-5e4d-ba3a-4ad424cf256f',
    '1bb647e1-a136-5c68-9ad8-f7c3b880816b',
    'd3b90730-bf1f-5c12-95c7-b1ff3908167c',
    '4f7a8183-d03c-52ad-9ef9-9821a1f40c8b',
    '1bb647e1-a136-5c68-9ad8-f7c3b880816b',
    'b337b8f3-49cf-5e4d-ba3a-4ad424cf256f',
    'rejected',
    'Предлагаю GTX 1660 Super за RTX 3060.',
    '2026-08-12T10:00:00Z',
    '2026-08-04T10:00:00Z',
    '2026-08-05T09:00:00Z'
) ON CONFLICT (chain_id) DO NOTHING;

COMMIT;
