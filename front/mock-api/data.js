// Сидовые данные mock-API. Формат приведён к каноническим моделям бэкенда
// (back/internal/domain/*.go), чтобы клиентам не требовалась нормализация.

const products = [
    {
        product_id: 'avito-gpu-rtx-3060',
        customer_id: 'user-pskov-01',
        category_id: 'video-cards',
        title: 'Видеокарта GeForce RTX 3060 12 ГБ',
        description:
            'В отличном состоянии, использовалась для игр. Полный комплект, проверка при встрече.',
        image: 'https://50.img.avito.st/image/1/1.iedNrLa4JQ57G6cDU56eolkMJwjzDacYewAnDP0FLQT7._xzbVJNce46KNeP-4N3tbbh2TTVb5eNgmHDUYIyRsnU',
        price: 28990,
        location: 'Псков',
        status: 'active',
        created_at: '2026-08-06T18:40:00Z',
        updated_at: '2026-08-06T18:40:00Z',
    },
    {
        product_id: 'avito-gpu-rx-6600',
        customer_id: 'user-pskov-02',
        category_id: 'video-cards',
        title: 'AMD Radeon RX 6600 8GB',
        description: 'Тихая игровая видеокарта, не майнилась. Возможен обмен на консоль или игры.',
        image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80',
        price: 21500,
        location: 'Псков',
        status: 'active',
        created_at: '2026-08-05T12:15:00Z',
        updated_at: '2026-08-05T12:15:00Z',
    },
    {
        product_id: 'avito-game-ps5-spider-man',
        customer_id: 'user-pskov-03',
        category_id: 'console-games',
        title: "Marvel's Spider-Man 2 для PS5",
        description: 'Физический диск, оригинальное издание. Диск и коробка без повреждений.',
        image: 'https://images.unsplash.com/photo-1605899435973-ca2d1a8861cf?auto=format&fit=crop&w=900&q=80',
        price: 3990,
        location: 'Псков',
        status: 'active',
        created_at: '2026-08-07T09:30:00Z',
        updated_at: '2026-08-07T09:30:00Z',
    },
    {
        product_id: 'avito-game-ps4-rdr2',
        customer_id: 'user-pskov-04',
        category_id: 'console-games',
        title: 'Red Dead Redemption 2 для PS4',
        description: 'Физическое издание на русском языке, состояние отличное.',
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80',
        price: 2490,
        location: 'Псков',
        status: 'active',
        created_at: '2026-08-04T16:05:00Z',
        updated_at: '2026-08-04T16:05:00Z',
    },
    {
        product_id: 'avito-game-xbox-forza',
        customer_id: 'user-pskov-07',
        category_id: 'console-games',
        title: 'Forza Horizon 5 для Xbox',
        description: 'Лицензионный диск, полностью рабочий. Обмен на игры для PS5.',
        image: 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=900&q=80',
        price: 2990,
        location: 'Псков',
        status: 'active',
        created_at: '2026-08-03T11:20:00Z',
        updated_at: '2026-08-03T11:20:00Z',
    },
    {
        product_id: 'avito-gpu-rtx-3070',
        customer_id: 'user-pskov-06',
        category_id: 'video-cards',
        title: 'GeForce RTX 3070 Gaming OC 8 ГБ',
        description: 'Рабочая видеокарта для игр в 2K. Проверка и самовывоз в Пскове.',
        image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80',
        price: 32990,
        location: 'Псков',
        status: 'active',
        created_at: '2026-08-02T14:10:00Z',
        updated_at: '2026-08-02T14:10:00Z',
    },
    {
        product_id: 'avito-gpu-gtx-1660',
        customer_id: 'user-pskov-05',
        category_id: 'video-cards',
        title: 'Видеокарта GTX 1660 Super',
        description: 'Аккуратное состояние, работает стабильно. Возможен обмен.',
        image: '',
        price: 16900,
        location: 'Псков',
        status: 'active',
        created_at: '2026-08-01T10:45:00Z',
        updated_at: '2026-08-01T10:45:00Z',
    },
    {
        product_id: 'avito-game-ps5-god-of-war',
        customer_id: 'user-pskov-08',
        category_id: 'console-games',
        title: 'God of War Ragnarök для PS5',
        description: 'Физический диск, коробка без сколов. Можно обменять на другую игру.',
        image: 'https://images.unsplash.com/photo-1605899435973-ca2d1a8861cf?auto=format&fit=crop&w=900&q=80',
        price: 4490,
        location: 'Псков',
        status: 'active',
        created_at: '2026-07-31T19:20:00Z',
        updated_at: '2026-07-31T19:20:00Z',
    },
    {
        product_id: 'avito-game-ps4-gta-v',
        customer_id: 'user-pskov-09',
        category_id: 'console-games',
        title: 'GTA V для PS4',
        description: 'Диск полностью рабочий, есть оригинальная коробка.',
        image: '',
        price: 1990,
        location: 'Псков',
        status: 'active',
        created_at: '2026-07-30T15:00:00Z',
        updated_at: '2026-07-30T15:00:00Z',
    },
    {
        product_id: 'avito-game-ps5-hogwarts',
        customer_id: 'user-pskov-10',
        category_id: 'console-games',
        title: 'Hogwarts Legacy для PS5',
        description: 'Физическое издание в хорошем состоянии, один владелец.',
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80',
        price: 3590,
        location: 'Псков',
        status: 'active',
        created_at: '2026-07-29T11:35:00Z',
        updated_at: '2026-07-29T11:35:00Z',
    },
    {
        product_id: 'avito-game-xbox-halo',
        customer_id: 'user-pskov-11',
        category_id: 'console-games',
        title: 'Halo Infinite для Xbox',
        description: 'Диск в хорошем состоянии. Рассмотрю обмен на игры для Xbox.',
        image: '',
        price: 2290,
        location: 'Псков',
        /* Владелец играет демо-роль «Новый пользователь»: сценарий проверяет
           добавление вещи из карточки чужого товара, поэтому профиль должен
           быть пустым. Товар архивируется, а не удаляется — так же поступает
           013_demo_accounts.sql. */
        status: 'archived',
        created_at: '2026-07-28T09:15:00Z',
        updated_at: '2026-07-28T09:15:00Z',
    },
];

const categories = [
    {
        category_id: 'computer-goods',
        name: 'Товары для компьютера',
        icon: '🖥️',
        created_at: '2026-08-07T00:00:00Z',
        updated_at: '2026-08-07T00:00:00Z',
    },
    {
        category_id: 'components',
        name: 'Комплектующие',
        icon: '🔧',
        parent_id: 'computer-goods',
        created_at: '2026-08-07T00:00:00Z',
        updated_at: '2026-08-07T00:00:00Z',
    },
    {
        category_id: 'video-cards',
        name: 'Видеокарты',
        icon: '🎮',
        parent_id: 'components',
        created_at: '2026-08-07T00:00:00Z',
        updated_at: '2026-08-07T00:00:00Z',
    },
    {
        category_id: 'console-games',
        name: 'Игры для приставок',
        icon: '🕹️',
        created_at: '2026-08-07T00:00:00Z',
        updated_at: '2026-08-07T00:00:00Z',
    },
];

// is_active используется только как эмуляция soft-delete в mock; в канонической
// модели бэкенда этого поля нет, и наружу оно не отдаётся (publicCustomer).
//
// demo_customer_id — идентификатор демонстрационного профиля из
// `013_demo_accounts.sql`, под которым в аккаунт входит витрина `/demo`.
// Он объявлен алиасом, а не заменяет читаемый customer_id: на mock-данные
// ссылаются товары, цепочки и отзывы, и подмена ключей развалила бы их
// связность. Роли розданы тем участникам, чьё состояние уже соответствует
// сценарию, но mock не воспроизводит подготовку из миграции целиком —
// полные сценарии живут на реальном бэкенде.
const customers = [
    {
        customer_id: 'user-pskov-01',
        // «В пути»: активная цепочка chain-pskov-01 ведёт к цели.
        demo_customer_id: '5e96d7bb-c76c-5558-881e-1b132e49d342',
        email: 'alexey@example.com',
        full_name: 'Ковалёв Алексей Игоревич',
        password: 'password123',
        is_active: true,
        created_at: '2026-08-07T00:00:00Z',
        updated_at: '2026-08-07T00:00:00Z',
    },
    {
        customer_id: 'user-pskov-02',
        // «Получатель»: сторона, ожидающая ответа по chain-pskov-02.
        demo_customer_id: '549fe311-ecdd-5f4e-9c1d-cea2d100e286',
        email: 'maria@example.com',
        full_name: 'Соколова Мария Андреевна',
        password: 'password123',
        is_active: true,
        created_at: '2026-08-07T00:00:00Z',
        updated_at: '2026-08-07T00:00:00Z',
    },
    {
        customer_id: 'user-pskov-03',
        email: 'ivan@example.com',
        full_name: 'Морозов Иван Петрович',
        password: 'password123',
        is_active: true,
        created_at: '2026-08-07T00:00:00Z',
        updated_at: '2026-08-07T00:00:00Z',
    },
    {
        customer_id: 'user-pskov-04',
        email: 'olga@example.com',
        full_name: 'Лебедева Ольга Сергеевна',
        password: 'password123',
        is_active: true,
        created_at: '2026-08-07T00:00:00Z',
        updated_at: '2026-08-07T00:00:00Z',
    },
    {
        customer_id: 'user-pskov-05',
        email: 'dmitry@example.com',
        full_name: 'Волков Дмитрий Николаевич',
        password: 'password123',
        is_active: true,
        created_at: '2026-08-07T00:00:00Z',
        updated_at: '2026-08-07T00:00:00Z',
    },
    {
        customer_id: 'user-pskov-06',
        email: 'elena@example.com',
        full_name: 'Зайцева Елена Викторовна',
        password: 'password123',
        is_active: true,
        created_at: '2026-08-07T00:00:00Z',
        updated_at: '2026-08-07T00:00:00Z',
    },
    {
        customer_id: 'user-pskov-07',
        // «Опытный участник»: завершённый chain-pskov-00 и отзывы по нему.
        demo_customer_id: 'd3b90730-bf1f-5c12-95c7-b1ff3908167c',
        email: 'sergey@example.com',
        full_name: 'Новиков Сергей Дмитриевич',
        password: 'password123',
        is_active: true,
        created_at: '2026-08-07T00:00:00Z',
        updated_at: '2026-08-07T00:00:00Z',
    },
    {
        customer_id: 'user-pskov-08',
        email: 'natalia@example.com',
        full_name: 'Егорова Наталья Олеговна',
        password: 'password123',
        is_active: true,
        created_at: '2026-08-07T00:00:00Z',
        updated_at: '2026-08-07T00:00:00Z',
    },
    {
        customer_id: 'user-pskov-09',
        // «Искатель»: активный товар есть, обменов нет — чистый старт поиска.
        demo_customer_id: '1a9b30df-8e74-53f8-a55d-0c8a016995be',
        email: 'pavel@example.com',
        full_name: 'Титов Павел Романович',
        password: 'password123',
        is_active: true,
        created_at: '2026-08-07T00:00:00Z',
        updated_at: '2026-08-07T00:00:00Z',
    },
    {
        customer_id: 'user-pskov-10',
        email: 'irina@example.com',
        full_name: 'Крылова Ирина Максимовна',
        password: 'password123',
        is_active: true,
        created_at: '2026-08-07T00:00:00Z',
        updated_at: '2026-08-07T00:00:00Z',
    },
    {
        customer_id: 'user-pskov-11',
        // «Новый пользователь»: обменов нет, единственный товар в архиве.
        demo_customer_id: '2db05252-81a6-5e50-b52f-57a19da8baa7',
        email: 'roman@example.com',
        full_name: 'Богданов Роман Алексеевич',
        password: 'password123',
        is_active: true,
        created_at: '2026-08-07T00:00:00Z',
        updated_at: '2026-08-07T00:00:00Z',
    },
];

// Каноническая модель domain.Chain: recipient_id, surcharge, expires_at и т.д.
// chain-pskov-00 — завершённый обмен из истории.
// chain-pskov-01 — активный обмен (после accept), по нему идёт переписка.
// chain-pskov-02 — ждёт ответа получателя (pending).
const chains = [
    {
        chain_id: 'chain-pskov-00',
        from_product_id: 'avito-game-xbox-forza',
        to_product_id: 'avito-gpu-gtx-1660',
        initiator_id: 'user-pskov-05',
        recipient_id: 'user-pskov-07',
        status: 'completed',
        message: 'Обменяю Forza Horizon 5 на GTX 1660 Super.',
        surcharge: { amount: 0, currency: 'RUB', payer: null },
        expires_at: '2026-08-02T12:00:00Z',
        created_at: '2026-08-01T12:00:00Z',
        updated_at: '2026-08-02T11:30:00Z',
    },
    {
        chain_id: 'chain-pskov-01',
        from_product_id: 'avito-gpu-rtx-3060',
        to_product_id: 'avito-game-ps5-spider-man',
        // Обмен внутри маршрута: шаг пути к RTX 3070, а не самостоятельная
        // сделка — на нём проверяется отметка о цепочке в комнате обмена.
        exchange_goal_id: 'avito-gpu-rtx-3070',
        route_step_id: 'avito-gpu-rtx-3060',
        initiator_id: 'user-pskov-01',
        recipient_id: 'user-pskov-03',
        status: 'active',
        message: 'Готов обменять RTX 3060 на Spider-Man 2 для PS5.',
        surcharge: { amount: 0, currency: 'RUB', payer: null },
        expires_at: '2026-08-15T19:00:00Z',
        created_at: '2026-08-06T19:00:00Z',
        updated_at: '2026-08-06T19:00:00Z',
    },
    {
        chain_id: 'chain-pskov-02',
        from_product_id: 'avito-game-ps4-rdr2',
        to_product_id: 'avito-gpu-rx-6600',
        initiator_id: 'user-pskov-04',
        recipient_id: 'user-pskov-02',
        status: 'pending',
        message: 'Рассмотрю обмен с доплатой.',
        surcharge: { amount: 0, currency: 'RUB', payer: null },
        expires_at: '2026-08-14T13:00:00Z',
        created_at: '2026-08-05T13:00:00Z',
        updated_at: '2026-08-05T13:00:00Z',
    },
];

// Переписка по сделкам: { [chain_id]: ChainMessage[] }.
const chainMessages = {
    'chain-pskov-01': [
        {
            message_id: 'msg-pskov-01',
            chain_id: 'chain-pskov-01',
            customer_id: 'user-pskov-01',
            body: 'Привет! Готов обсудить обмен RTX 3060 на Spider-Man 2.',
            created_at: '2026-08-06T19:05:00Z',
        },
        {
            message_id: 'msg-pskov-02',
            chain_id: 'chain-pskov-01',
            customer_id: 'user-pskov-03',
            body: 'Да, давайте встретимся у ТЦ в субботу.',
            created_at: '2026-08-06T19:20:00Z',
        },
    ],
};

// Подтверждения итога обмена: { [chain_id]: ChainConfirmation[] }.
// Поле success в канонической модели — bool.
const confirmations = {
    'chain-pskov-00': [
        {
            customer_id: 'user-pskov-05',
            success: true,
            created_at: '2026-08-02T11:20:00Z',
        },
        {
            customer_id: 'user-pskov-07',
            success: true,
            created_at: '2026-08-02T11:30:00Z',
        },
    ],
    'chain-pskov-01': [],
};

const reviews = [
    {
        review_id: 'review-pskov-01',
        chain_id: 'chain-pskov-00',
        from_customer_id: 'user-pskov-05',
        to_customer_id: 'user-pskov-07',
        product_id: 'avito-gpu-gtx-1660',
        rating: 5,
        comment: 'Быстро договорились, видеокарта соответствует описанию.',
        created_at: '2026-08-02T12:00:00Z',
        updated_at: '2026-08-02T12:00:00Z',
    },
    {
        review_id: 'review-pskov-02',
        chain_id: 'chain-pskov-00',
        from_customer_id: 'user-pskov-07',
        to_customer_id: 'user-pskov-05',
        product_id: 'avito-game-xbox-forza',
        rating: 4,
        comment: 'Всё хорошо, встретились в удобном месте и обменялись без проблем.',
        created_at: '2026-08-02T14:00:00Z',
        updated_at: '2026-08-02T14:00:00Z',
    },
];

// Желания владельцев — то, из чего собирается блок «Вам подойдёт»: карточка
// попадает в него, когда у смотрящего уже есть вещь из нужной владельцу
// категории. Поэтому желания расставлены в обе стороны — и у владельцев
// видеокарт, и у владельцев игр: иначе блок был бы виден только половине
// демонстрационных участников.
const wishlists = [
    {
        wishlist_id: 'wishlist-pskov-01',
        product_id: 'avito-gpu-rtx-3060',
        name: 'Что хочу получить за видеокарту',
        created_at: '2026-08-06T18:50:00Z',
        updated_at: '2026-08-06T18:50:00Z',
    },
    {
        wishlist_id: 'wishlist-pskov-02',
        product_id: 'avito-gpu-rx-6600',
        name: 'Обменяю на консоль или игры',
        created_at: '2026-08-05T12:30:00Z',
        updated_at: '2026-08-05T12:30:00Z',
    },
    {
        wishlist_id: 'wishlist-pskov-03',
        product_id: 'avito-gpu-rtx-3070',
        name: 'Что хочу получить за 3070',
        created_at: '2026-08-02T14:30:00Z',
        updated_at: '2026-08-02T14:30:00Z',
    },
    {
        wishlist_id: 'wishlist-pskov-04',
        product_id: 'avito-game-xbox-forza',
        name: 'Меняю на игры для PS5',
        created_at: '2026-08-03T11:40:00Z',
        updated_at: '2026-08-03T11:40:00Z',
    },
    {
        wishlist_id: 'wishlist-pskov-05',
        product_id: 'avito-game-xbox-halo',
        name: 'Рассмотрю обмен на игры',
        created_at: '2026-07-28T09:40:00Z',
        updated_at: '2026-07-28T09:40:00Z',
    },
    {
        wishlist_id: 'wishlist-pskov-06',
        product_id: 'avito-game-ps4-rdr2',
        name: 'Хочу видеокарту взамен',
        created_at: '2026-08-04T16:25:00Z',
        updated_at: '2026-08-04T16:25:00Z',
    },
    {
        wishlist_id: 'wishlist-pskov-07',
        product_id: 'avito-game-ps5-hogwarts',
        name: 'Меняю на комплектующие',
        created_at: '2026-07-29T11:50:00Z',
        updated_at: '2026-07-29T11:50:00Z',
    },
];

const wishlistOptions = {
    'wishlist-pskov-01': ['console-games'],
    'wishlist-pskov-02': ['console-games'],
    'wishlist-pskov-03': ['console-games'],
    'wishlist-pskov-04': ['console-games'],
    'wishlist-pskov-05': ['console-games'],
    'wishlist-pskov-06': ['video-cards'],
    'wishlist-pskov-07': ['video-cards'],
};

// Категории, которые клиент отметил себе интересными — customer_id -> category_id[].
const customerRecommendations = {};

export {
    categories,
    customers,
    products,
    chains,
    chainMessages,
    confirmations,
    reviews,
    wishlists,
    wishlistOptions,
    customerRecommendations,
};
