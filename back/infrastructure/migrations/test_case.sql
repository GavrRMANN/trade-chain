-- ============================================================
-- TEST DATA: Trade Chain
--
-- Основная цепочка:
--
-- RTX 4080
--     ↓ хочет ноутбук
-- MacBook Pro
--     ↓ хочет велосипед
-- GT Avalanche
--     ↓ хочет телефон
-- iPhone 15
--     ↓ хочет видеокарту
-- RTX 4080
--
-- Для пользователя user1:
--
-- RTX 4080 -> MacBook Pro -> GT Avalanche -> iPhone 15
--
-- ============================================================

TRUNCATE TABLE customers CASCADE;

DO $$
DECLARE

    -- ========================================================
    -- USERS
    -- ========================================================

    cust1 UUID;
    cust2 UUID;
    cust3 UUID;
    cust4 UUID;
    cust5 UUID;
    cust6 UUID;
    cust7 UUID;
    cust8 UUID;
    cust9 UUID;
    cust10 UUID;
    cust11 UUID;
    cust12 UUID;
    cust13 UUID;
    cust14 UUID;
    cust15 UUID;

    -- ========================================================
    -- CATEGORIES
    -- ========================================================

    cat_phone UUID;
    cat_bike UUID;
    cat_laptop UUID;
    cat_gpu UUID;
    cat_console UUID;
    cat_camera UUID;
    cat_watch UUID;
    cat_tablet UUID;

    -- ========================================================
    -- MAIN CHAIN PRODUCTS
    -- ========================================================

    prod_phone UUID;
    prod_bike UUID;
    prod_laptop UUID;
    prod_gpu UUID;

    -- ========================================================
    -- ADDITIONAL PRODUCTS
    -- ========================================================

    prod_phone2 UUID;
    prod_phone3 UUID;

    prod_bike2 UUID;
    prod_bike3 UUID;

    prod_laptop2 UUID;
    prod_laptop3 UUID;

    prod_gpu2 UUID;
    prod_gpu3 UUID;

    prod_console UUID;
    prod_camera UUID;
    prod_watch UUID;
    prod_tablet UUID;

    prod_multi1 UUID;
    prod_multi2 UUID;

    -- ========================================================
    -- WISHLISTS
    -- ========================================================

    wish_phone UUID;
    wish_phone2 UUID;
    wish_phone3 UUID;

    wish_bike UUID;
    wish_bike2 UUID;
    wish_bike3 UUID;

    wish_laptop UUID;
    wish_laptop2 UUID;
    wish_laptop3 UUID;

    wish_gpu UUID;
    wish_gpu2 UUID;
    wish_gpu3 UUID;

    wish_console UUID;
    wish_camera UUID;
    wish_watch UUID;
    wish_tablet UUID;

    wish_multi1 UUID;
    wish_multi2 UUID;

BEGIN

    -- ========================================================
    -- USERS
    -- ========================================================

    INSERT INTO customers(email, password_hash)
    VALUES ('user1@test.com', '$2a$10$m.NfG.SFSyf7.nrMZ9x4bu/1d5xHThLC59PLM1Xrk9fvqmUmIEKLu')
    RETURNING customer_id INTO cust1;

    INSERT INTO customers(email, password_hash)
    VALUES ('user2@test.com', '$2a$10$m.NfG.SFSyf7.nrMZ9x4bu/1d5xHThLC59PLM1Xrk9fvqmUmIEKLu')
    RETURNING customer_id INTO cust2;

    INSERT INTO customers(email, password_hash)
    VALUES ('user3@test.com', '$2a$10$m.NfG.SFSyf7.nrMZ9x4bu/1d5xHThLC59PLM1Xrk9fvqmUmIEKLu')
    RETURNING customer_id INTO cust3;

    INSERT INTO customers(email, password_hash)
    VALUES ('user4@test.com', '$2a$10$m.NfG.SFSyf7.nrMZ9x4bu/1d5xHThLC59PLM1Xrk9fvqmUmIEKLu')
    RETURNING customer_id INTO cust4;

    INSERT INTO customers(email, password_hash)
    VALUES ('user5@test.com', '$2a$10$m.NfG.SFSyf7.nrMZ9x4bu/1d5xHThLC59PLM1Xrk9fvqmUmIEKLu')
    RETURNING customer_id INTO cust5;

    INSERT INTO customers(email, password_hash)
    VALUES ('user6@test.com', '$2a$10$m.NfG.SFSyf7.nrMZ9x4bu/1d5xHThLC59PLM1Xrk9fvqmUmIEKLu')
    RETURNING customer_id INTO cust6;

    INSERT INTO customers(email, password_hash)
    VALUES ('user7@test.com', '$2a$10$m.NfG.SFSyf7.nrMZ9x4bu/1d5xHThLC59PLM1Xrk9fvqmUmIEKLu')
    RETURNING customer_id INTO cust7;

    INSERT INTO customers(email, password_hash)
    VALUES ('user8@test.com', '$2a$10$m.NfG.SFSyf7.nrMZ9x4bu/1d5xHThLC59PLM1Xrk9fvqmUmIEKLu')
    RETURNING customer_id INTO cust8;

    INSERT INTO customers(email, password_hash)
    VALUES ('user9@test.com', '$2a$10$m.NfG.SFSyf7.nrMZ9x4bu/1d5xHThLC59PLM1Xrk9fvqmUmIEKLu')
    RETURNING customer_id INTO cust9;

    INSERT INTO customers(email, password_hash)
    VALUES ('user10@test.com', '$2a$10$m.NfG.SFSyf7.nrMZ9x4bu/1d5xHThLC59PLM1Xrk9fvqmUmIEKLu')
    RETURNING customer_id INTO cust10;

    INSERT INTO customers(email, password_hash)
    VALUES ('user11@test.com', '$2a$10$m.NfG.SFSyf7.nrMZ9x4bu/1d5xHThLC59PLM1Xrk9fvqmUmIEKLu')
    RETURNING customer_id INTO cust11;

    INSERT INTO customers(email, password_hash)
    VALUES ('user12@test.com', '1$2a$10$m.NfG.SFSyf7.nrMZ9x4bu/1d5xHThLC59PLM1Xrk9fvqmUmIEKLu')
    RETURNING customer_id INTO cust12;

    INSERT INTO customers(email, password_hash)
    VALUES ('user13@test.com', '$2a$10$m.NfG.SFSyf7.nrMZ9x4bu/1d5xHThLC59PLM1Xrk9fvqmUmIEKLu')
    RETURNING customer_id INTO cust13;

    INSERT INTO customers(email, password_hash)
    VALUES ('user14@test.com', '$2a$10$m.NfG.SFSyf7.nrMZ9x4bu/1d5xHThLC59PLM1Xrk9fvqmUmIEKLu')
    RETURNING customer_id INTO cust14;

    INSERT INTO customers(email, password_hash)
    VALUES ('user15@test.com', '$2a$10$m.NfG.SFSyf7.nrMZ9x4bu/1d5xHThLC59PLM1Xrk9fvqmUmIEKLu')
    RETURNING customer_id INTO cust15;


    -- ========================================================
    -- CATEGORIES
    -- ========================================================

    INSERT INTO categories(name)
    VALUES ('Телефон')
    RETURNING category_id INTO cat_phone;

    INSERT INTO categories(name)
    VALUES ('Велосипед')
    RETURNING category_id INTO cat_bike;

    INSERT INTO categories(name)
    VALUES ('Ноутбук')
    RETURNING category_id INTO cat_laptop;

    INSERT INTO categories(name)
    VALUES ('Видеокарта')
    RETURNING category_id INTO cat_gpu;

    INSERT INTO categories(name)
    VALUES ('Игровая приставка')
    RETURNING category_id INTO cat_console;

    INSERT INTO categories(name)
    VALUES ('Фотоаппарат')
    RETURNING category_id INTO cat_camera;

    INSERT INTO categories(name)
    VALUES ('Часы')
    RETURNING category_id INTO cat_watch;

    INSERT INTO categories(name)
    VALUES ('Планшет')
    RETURNING category_id INTO cat_tablet;


    -- ========================================================
    -- MAIN CHAIN
    -- ========================================================

    -- User1
    -- конечный товар пользователя
    INSERT INTO products(
        customer_id,
        category_id,
        title,
        description
    )
    VALUES (
        cust1,
        cat_phone,
        'iPhone 15',
        'Телефон пользователя. Состояние отличное.'
    )
    RETURNING product_id INTO prod_phone;


    -- User2
    INSERT INTO products(
        customer_id,
        category_id,
        title,
        description
    )
    VALUES (
        cust2,
        cat_bike,
        'GT Avalanche',
        'Горный велосипед, размер M.'
    )
    RETURNING product_id INTO prod_bike;


    -- User3
    INSERT INTO products(
        customer_id,
        category_id,
        title,
        description
    )
    VALUES (
        cust3,
        cat_laptop,
        'MacBook Pro',
        'MacBook Pro 14, M3 Pro, 18GB RAM.'
    )
    RETURNING product_id INTO prod_laptop;


    -- User4
    INSERT INTO products(
        customer_id,
        category_id,
        title,
        description
    )
    VALUES (
        cust4,
        cat_gpu,
        'RTX 4080',
        'NVIDIA GeForce RTX 4080.'
    )
    RETURNING product_id INTO prod_gpu;


    -- ========================================================
    -- ADDITIONAL PHONES
    -- ========================================================

    INSERT INTO products(
        customer_id,
        category_id,
        title,
        description
    )
    VALUES (
        cust5,
        cat_phone,
        'iPhone 13',
        'Apple iPhone 13 128GB.'
    )
    RETURNING product_id INTO prod_phone2;


    INSERT INTO products(
        customer_id,
        category_id,
        title,
        description
    )
    VALUES (
        cust6,
        cat_phone,
        'Samsung Galaxy S24',
        'Флагманский смартфон Samsung.'
    )
    RETURNING product_id INTO prod_phone3;


    -- ========================================================
    -- ADDITIONAL BIKES
    -- ========================================================

    INSERT INTO products(
        customer_id,
        category_id,
        title,
        description
    )
    VALUES (
        cust7,
        cat_bike,
        'Cube Analog',
        'Горный велосипед Cube.'
    )
    RETURNING product_id INTO prod_bike2;


    INSERT INTO products(
        customer_id,
        category_id,
        title,
        description
    )
    VALUES (
        cust8,
        cat_bike,
        'Trek Marlin 7',
        'Горный велосипед Trek.'
    )
    RETURNING product_id INTO prod_bike3;


    -- ========================================================
    -- ADDITIONAL LAPTOPS
    -- ========================================================

    INSERT INTO products(
        customer_id,
        category_id,
        title,
        description
    )
    VALUES (
        cust9,
        cat_laptop,
        'Lenovo Legion 5',
        'Игровой ноутбук Lenovo.'
    )
    RETURNING product_id INTO prod_laptop2;


    INSERT INTO products(
        customer_id,
        category_id,
        title,
        description
    )
    VALUES (
        cust10,
        cat_laptop,
        'ASUS ROG Strix',
        'Игровой ноутбук ASUS.'
    )
    RETURNING product_id INTO prod_laptop3;


    -- ========================================================
    -- ADDITIONAL GPUS
    -- ========================================================

    INSERT INTO products(
        customer_id,
        category_id,
        title,
        description
    )
    VALUES (
        cust11,
        cat_gpu,
        'RTX 4070 Super',
        'NVIDIA GeForce RTX 4070 Super.'
    )
    RETURNING product_id INTO prod_gpu2;


    INSERT INTO products(
        customer_id,
        category_id,
        title,
        description
    )
    VALUES (
        cust12,
        cat_gpu,
        'RX 7900 XTX',
        'AMD Radeon RX 7900 XTX.'
    )
    RETURNING product_id INTO prod_gpu3;


    -- ========================================================
    -- OTHER CATEGORIES
    -- ========================================================

    INSERT INTO products(
        customer_id,
        category_id,
        title,
        description
    )
    VALUES (
        cust13,
        cat_console,
        'PlayStation 5',
        'Игровая консоль Sony.'
    )
    RETURNING product_id INTO prod_console;


    INSERT INTO products(
        customer_id,
        category_id,
        title,
        description
    )
    VALUES (
        cust13,
        cat_camera,
        'Sony Alpha A7 III',
        'Полнокадровая камера.'
    )
    RETURNING product_id INTO prod_camera;


    INSERT INTO products(
        customer_id,
        category_id,
        title,
        description
    )
    VALUES (
        cust14,
        cat_watch,
        'Apple Watch Ultra',
        'Умные часы Apple.'
    )
    RETURNING product_id INTO prod_watch;


    INSERT INTO products(
        customer_id,
        category_id,
        title,
        description
    )
    VALUES (
        cust15,
        cat_tablet,
        'iPad Pro',
        'Планшет Apple.'
    )
    RETURNING product_id INTO prod_tablet;


    -- ========================================================
    -- USER WITH MULTIPLE PRODUCTS
    -- ========================================================

    INSERT INTO products(
        customer_id,
        category_id,
        title,
        description
    )
    VALUES (
        cust1,
        cat_console,
        'Xbox Series X',
        'Игровая приставка.'
    )
    RETURNING product_id INTO prod_multi1;


    INSERT INTO products(
        customer_id,
        category_id,
        title,
        description
    )
    VALUES (
        cust1,
        cat_laptop,
        'Dell XPS 15',
        'Рабочий ноутбук.'
    )
    RETURNING product_id INTO prod_multi2;


    -- ========================================================
    -- WISHLISTS: MAIN CHAIN
    -- ========================================================

    -- iPhone -> хочет видеокарту
    INSERT INTO wishlists(product_id, name)
    VALUES (
        prod_phone,
        'Хочу видеокарту'
    )
    RETURNING wishlist_id INTO wish_phone;

    INSERT INTO wishlist_options
    VALUES (
        wish_phone,
        cat_gpu
    );


    -- Велосипед -> хочет телефон
    INSERT INTO wishlists(product_id, name)
    VALUES (
        prod_bike,
        'Хочу телефон'
    )
    RETURNING wishlist_id INTO wish_bike;

    INSERT INTO wishlist_options
    VALUES (
        wish_bike,
        cat_phone
    );


    -- Ноутбук -> хочет велосипед
    INSERT INTO wishlists(product_id, name)
    VALUES (
        prod_laptop,
        'Хочу велосипед'
    )
    RETURNING wishlist_id INTO wish_laptop;

    INSERT INTO wishlist_options
    VALUES (
        wish_laptop,
        cat_bike
    );


    -- RTX 4080 -> хочет ноутбук
    INSERT INTO wishlists(product_id, name)
    VALUES (
        prod_gpu,
        'Хочу ноутбук'
    )
    RETURNING wishlist_id INTO wish_gpu;

    INSERT INTO wishlist_options
    VALUES (
        wish_gpu,
        cat_laptop
    );


    -- ========================================================
    -- ALTERNATIVE CHAINS
    -- ========================================================

    -- iPhone 13 -> хочет видеокарту
    INSERT INTO wishlists(product_id, name)
    VALUES (
        prod_phone2,
        'Хочу видеокарту'
    )
    RETURNING wishlist_id INTO wish_phone2;

    INSERT INTO wishlist_options
    VALUES (
        wish_phone2,
        cat_gpu
    );


    -- Samsung -> хочет ноутбук
    INSERT INTO wishlists(product_id, name)
    VALUES (
        prod_phone3,
        'Хочу ноутбук'
    )
    RETURNING wishlist_id INTO wish_phone3;

    INSERT INTO wishlist_options
    VALUES (
        wish_phone3,
        cat_laptop
    );


    -- Cube -> хочет телефон
    INSERT INTO wishlists(product_id, name)
    VALUES (
        prod_bike2,
        'Хочу телефон'
    )
    RETURNING wishlist_id INTO wish_bike2;

    INSERT INTO wishlist_options
    VALUES (
        wish_bike2,
        cat_phone
    );


    -- Trek -> хочет видеокарту
    INSERT INTO wishlists(product_id, name)
    VALUES (
        prod_bike3,
        'Хочу видеокарту'
    )
    RETURNING wishlist_id INTO wish_bike3;

    INSERT INTO wishlist_options
    VALUES (
        wish_bike3,
        cat_gpu
    );


    -- Lenovo -> хочет велосипед
    INSERT INTO wishlists(product_id, name)
    VALUES (
        prod_laptop2,
        'Хочу велосипед'
    )
    RETURNING wishlist_id INTO wish_laptop2;

    INSERT INTO wishlist_options
    VALUES (
        wish_laptop2,
        cat_bike
    );


    -- ASUS -> хочет телефон
    INSERT INTO wishlists(product_id, name)
    VALUES (
        prod_laptop3,
        'Хочу телефон'
    )
    RETURNING wishlist_id INTO wish_laptop3;

    INSERT INTO wishlist_options
    VALUES (
        wish_laptop3,
        cat_phone
    );


    -- 4070 -> хочет ноутбук
    INSERT INTO wishlists(product_id, name)
    VALUES (
        prod_gpu2,
        'Хочу ноутбук'
    )
    RETURNING wishlist_id INTO wish_gpu2;

    INSERT INTO wishlist_options
    VALUES (
        wish_gpu2,
        cat_laptop
    );


    -- 7900 XTX -> хочет консоль
    INSERT INTO wishlists(product_id, name)
    VALUES (
        prod_gpu3,
        'Хочу игровую приставку'
    )
    RETURNING wishlist_id INTO wish_gpu3;

    INSERT INTO wishlist_options
    VALUES (
        wish_gpu3,
        cat_console
    );


    -- ========================================================
    -- OTHER WISHLISTS
    -- ========================================================

    INSERT INTO wishlists(product_id, name)
    VALUES (
        prod_console,
        'Хочу телефон или видеокарту'
    )
    RETURNING wishlist_id INTO wish_console;

    INSERT INTO wishlist_options
    VALUES
        (wish_console, cat_phone),
        (wish_console, cat_gpu);


    INSERT INTO wishlists(product_id, name)
    VALUES (
        prod_camera,
        'Хочу ноутбук'
    )
    RETURNING wishlist_id INTO wish_camera;

    INSERT INTO wishlist_options
    VALUES (
        wish_camera,
        cat_laptop
    );


    INSERT INTO wishlists(product_id, name)
    VALUES (
        prod_watch,
        'Хочу телефон'
    )
    RETURNING wishlist_id INTO wish_watch;

    INSERT INTO wishlist_options
    VALUES (
        wish_watch,
        cat_phone
    );


    INSERT INTO wishlists(product_id, name)
    VALUES (
        prod_tablet,
        'Хочу велосипед'
    )
    RETURNING wishlist_id INTO wish_tablet;

    INSERT INTO wishlist_options
    VALUES (
        wish_tablet,
        cat_bike
    );


    -- ========================================================
    -- MULTI-PRODUCT USER WISHLISTS
    -- ========================================================

    INSERT INTO wishlists(product_id, name)
    VALUES (
        prod_multi1,
        'Хочу видеокарту'
    )
    RETURNING wishlist_id INTO wish_multi1;

    INSERT INTO wishlist_options
    VALUES (
        wish_multi1,
        cat_gpu
    );


    INSERT INTO wishlists(product_id, name)
    VALUES (
        prod_multi2,
        'Хочу велосипед'
    )
    RETURNING wishlist_id INTO wish_multi2;

    INSERT INTO wishlist_options
    VALUES (
        wish_multi2,
        cat_bike
    );


    -- ========================================================
    -- REVIEWS
    -- ========================================================

    INSERT INTO reviews(
        from_customer_id,
        to_customer_id,
        product_id,
        rating
    )
    VALUES
        (cust1, cust2, prod_bike, 5),
        (cust2, cust3, prod_laptop, 5),
        (cust3, cust4, prod_gpu, 5),
        (cust5, cust7, prod_bike2, 4),
        (cust6, cust9, prod_laptop2, 5),
        (cust8, cust11, prod_gpu2, 4);


    -- ========================================================
    -- OUTPUT
    -- ========================================================

    RAISE NOTICE '';
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'TEST DATABASE CREATED';
    RAISE NOTICE '============================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'MAIN CHAIN:';
    RAISE NOTICE 'RTX 4080 -> MacBook Pro -> GT Avalanche -> iPhone 15';
    RAISE NOTICE '';
    RAISE NOTICE 'USER1: user1@test.com';
    RAISE NOTICE 'USER2: user2@test.com';
    RAISE NOTICE 'USER3: user3@test.com';
    RAISE NOTICE 'USER4: user4@test.com';
    RAISE NOTICE '';
    RAISE NOTICE '============================================================';

END;
$$;


-- ============================================================
-- УДОБНАЯ ТАБЛИЦА ДЛЯ POSTMAN
--
-- Здесь можно увидеть UUID, которые нужно передавать
-- в API.
-- ============================================================

SELECT
    c.email,
    p.product_id,
    p.title AS product_name,
    cat.category_id,
    cat.name AS category_name,
    w.wishlist_id,
    w.name AS wishlist_name
FROM products p
JOIN customers c
    ON c.customer_id = p.customer_id
LEFT JOIN categories cat
    ON cat.category_id = p.category_id
LEFT JOIN wishlists w
    ON w.product_id = p.product_id
ORDER BY c.email, p.title;