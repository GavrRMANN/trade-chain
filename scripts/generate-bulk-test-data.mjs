/**
 * Массово генерирует тестовые категории, товары и продавцов для наполнения
 * витрины: SQL пишется руками только для словарей ниже, все строки —
 * комбинаторика + процедурные SVG-плейсхолдеры без внешних картинок.
 *
 * Запуск: node scripts/generate-bulk-test-data.mjs
 * Результат: back/infrastructure/migrations/014_bulk_test_data.sql
 */
import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

const outputPath = new URL('../back/infrastructure/migrations/014_bulk_test_data.sql', import.meta.url);
const uuidNamespace = '6ba7b8119dad11d180b400c04fd430c8';
const passwordHash = '$2y$10$7fpSvEXlg0/63LutgOzEyeCMYUyegqEZ3P67sZsN0y0khT0JCghMy';

function uuid(sourceId) {
    const namespace = Buffer.from(uuidNamespace, 'hex');
    const hash = createHash('sha1').update(namespace).update(sourceId).digest();
    hash[6] = (hash[6] & 0x0f) | 0x50;
    hash[8] = (hash[8] & 0x3f) | 0x80;
    const hex = hash.subarray(0, 16).toString('hex');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// Простой детерминированный PRNG (mulberry32) от строкового seed —
// одинаковый набор данных при повторном запуске, без внешних зависимостей.
function rng(seed) {
    let a = createHash('sha1').update(seed).digest().readUInt32LE(0) || 1;
    return () => {
        a |= 0; a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const int = (r, min, max) => Math.floor(r() * (max - min + 1)) + min;
const round = (n, step) => Math.round(n / step) * step;
function sql(raw) {
    if (raw === null || raw === undefined) return 'NULL';
    if (typeof raw === 'number') return String(raw);
    return `'${String(raw).replaceAll("'", "''")}'`;
}
function insert(table, columns, rows) {
    if (rows.length === 0) return '';
    const records = rows.map((row) => `    (${columns.map((c) => sql(row[c])).join(', ')})`).join(',\n');
    return `INSERT INTO ${table} (${columns.join(', ')}) VALUES\n${records}\nON CONFLICT DO NOTHING;\n`;
}

// ---------- процедурный SVG-плейсхолдер ----------
// Один и тот же товар всегда даёт одну и ту же картинку (seed = product_id),
// разные товары — разные оттенки/фигуры/монограмму без единого файла-ассета.
function svgPlaceholder(seed, monogram) {
    const r = rng(seed);
    const hue = int(r, 0, 359);
    const bg = `hsl(${hue} 55% 42%)`;
    const accent = `hsl(${(hue + 40) % 360} 70% 62%)`;
    const shapes = [];
    const shapeCount = int(r, 2, 4);
    for (let i = 0; i < shapeCount; i++) {
        const cx = int(r, 20, 380);
        const cy = int(r, 20, 280);
        const radius = int(r, 30, 110);
        shapes.push(`<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${accent}" opacity="0.35"/>`);
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${bg}"/>${shapes.join('')}<text x="200" y="172" font-family="sans-serif" font-size="108" font-weight="700" fill="#ffffff" fill-opacity="0.92" text-anchor="middle">${monogram}</text></svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// ---------- словарь категорий ----------
const catalog = [
    ['Одежда и обувь', '👗', ['Мужская одежда', 'Женская одежда', 'Детская одежда', 'Обувь', 'Аксессуары']],
    ['Дом и сад', '🏡', ['Мебель', 'Кухонная утварь', 'Освещение', 'Текстиль для дома', 'Садовый инвентарь']],
    ['Хобби и творчество', '🎨', ['Рукоделие', 'Рисование и живопись', 'Настольные игры', 'Модели и конструкторы']],
    ['Спорт и отдых', '⚽', ['Велосипеды', 'Тренажёры', 'Туризм и кемпинг', 'Зимний спорт', 'Спортивная одежда']],
    ['Книги и журналы', '📚', ['Художественная литература', 'Учебная литература', 'Комиксы и манга', 'Журналы']],
    ['Музыкальные инструменты', '🎸', ['Гитары', 'Клавишные', 'Ударные', 'Духовые']],
    ['Животные и товары для них', '🐾', ['Аквариумистика', 'Товары для собак', 'Товары для кошек', 'Клетки и вольеры']],
    ['Красота и здоровье', '💄', ['Косметика', 'Парфюмерия', 'Уход за телом', 'Медтехника']],
    ['Детские товары', '🧸', ['Игрушки', 'Коляски и автокресла', 'Детская мебель', 'Развивающие игры']],
    ['Инструменты и стройматериалы', '🔧', ['Электроинструмент', 'Ручной инструмент', 'Стройматериалы', 'Сантехника']],
    ['Электроника', '📱', ['Смартфоны', 'Ноутбуки', 'Планшеты', 'Наушники и колонки', 'Фототехника']],
    ['Коллекционирование', '🪙', ['Монеты и банкноты', 'Марки', 'Значки', 'Антиквариат']],
];

const nounsBySub = {
    'Мужская одежда': ['Куртка', 'Джинсы', 'Свитер', 'Рубашка', 'Пальто'],
    'Женская одежда': ['Платье', 'Юбка', 'Блузка', 'Плащ', 'Кардиган'],
    'Детская одежда': ['Комбинезон', 'Курточка', 'Платьице', 'Костюм'],
    'Обувь': ['Кроссовки', 'Ботинки', 'Туфли', 'Сапоги', 'Кеды'],
    'Аксессуары': ['Рюкзак', 'Ремень', 'Шарф', 'Сумка', 'Часы'],
    'Мебель': ['Диван', 'Кресло', 'Книжный шкаф', 'Стол письменный', 'Стеллаж'],
    'Кухонная утварь': ['Набор кастрюль', 'Сковорода', 'Блендер', 'Мультиварка'],
    'Освещение': ['Торшер', 'Настольная лампа', 'Гирлянда', 'Бра'],
    'Текстиль для дома': ['Плед', 'Комплект постельного белья', 'Шторы', 'Ковёр'],
    'Садовый инвентарь': ['Тачка садовая', 'Триммер', 'Лейка', 'Набор садовых инструментов'],
    'Рукоделие': ['Набор для вышивки', 'Швейная машинка', 'Пряжа для вязания', 'Бисер'],
    'Рисование и живопись': ['Мольберт', 'Набор акварели', 'Холсты', 'Планшет для рисования'],
    'Настольные игры': ['Монополия', 'Каркассон', 'Манчкин', 'Шахматы'],
    'Модели и конструкторы': ['LEGO Technic', 'Сборная модель корабля', 'Радиоуправляемая машина'],
    'Велосипеды': ['Горный велосипед', 'Городской велосипед', 'BMX', 'Электровелосипед'],
    'Тренажёры': ['Беговая дорожка', 'Гантели наборные', 'Эллипсоид', 'Турник'],
    'Туризм и кемпинг': ['Палатка', 'Спальный мешок', 'Рюкзак туристический', 'Горелка газовая'],
    'Зимний спорт': ['Лыжи', 'Сноуборд', 'Коньки', 'Санки'],
    'Спортивная одежда': ['Термобельё', 'Кроссовки для бега', 'Спортивный костюм'],
    'Художественная литература': ['Собрание сочинений', 'Роман в твёрдом переплёте', 'Сборник рассказов'],
    'Учебная литература': ['Учебник по математике', 'Словарь английского', 'Пособие для ЕГЭ'],
    'Комиксы и манга': ['Том манги', 'Комикс Marvel', 'Графический роман'],
    'Журналы': ['Подшивка журналов', 'Коллекционный выпуск журнала'],
    'Гитары': ['Акустическая гитара', 'Электрогитара', 'Укулеле', 'Бас-гитара'],
    'Клавишные': ['Синтезатор', 'MIDI-клавиатура', 'Пианино цифровое'],
    'Ударные': ['Электронные барабаны', 'Кахон', 'Набор перкуссии'],
    'Духовые': ['Труба', 'Флейта', 'Саксофон'],
    'Аквариумистика': ['Аквариум 100л', 'Компрессор для аквариума', 'Набор декораций'],
    'Товары для собак': ['Лежанка для собаки', 'Переноска', 'Шлейка'],
    'Товары для кошек': ['Когтеточка', 'Домик для кошки', 'Переноска для кота'],
    'Клетки и вольеры': ['Клетка для попугая', 'Вольер уличный'],
    'Косметика': ['Набор косметики', 'Палетка теней'],
    'Парфюмерия': ['Парфюм мужской', 'Парфюм женский'],
    'Уход за телом': ['Массажёр', 'Набор для ухода'],
    'Медтехника': ['Тонометр', 'Ингалятор', 'Массажная подушка'],
    'Игрушки': ['Конструктор', 'Мягкая игрушка', 'Кукла', 'Радиоуправляемый вертолёт'],
    'Коляски и автокресла': ['Коляска прогулочная', 'Автокресло', 'Коляска-трансформер'],
    'Детская мебель': ['Кроватка детская', 'Манеж', 'Стульчик для кормления'],
    'Развивающие игры': ['Пазл', 'Развивающий коврик', 'Сортер'],
    'Электроинструмент': ['Шуруповёрт', 'Перфоратор', 'Болгарка', 'Дрель'],
    'Ручной инструмент': ['Набор гаечных ключей', 'Молоток', 'Набор отвёрток'],
    'Стройматериалы': ['Остаток ламината', 'Плитка керамическая', 'Утеплитель'],
    'Сантехника': ['Смеситель', 'Радиатор отопления', 'Бойлер'],
    'Смартфоны': ['iPhone', 'Samsung Galaxy', 'Xiaomi Redmi', 'Google Pixel'],
    'Ноутбуки': ['Ноутбук ASUS', 'Ноутбук Lenovo', 'MacBook', 'Ноутбук HP'],
    'Планшеты': ['iPad', 'Samsung Tab', 'Планшет Lenovo'],
    'Наушники и колонки': ['Беспроводные наушники', 'Портативная колонка', 'Проводные наушники'],
    'Фототехника': ['Зеркальный фотоаппарат', 'Экшн-камера', 'Объектив', 'Штатив'],
    'Монеты и банкноты': ['Юбилейная монета', 'Банкнота коллекционная', 'Набор монет СССР'],
    'Марки': ['Марка почтовая', 'Альбом с марками'],
    'Значки': ['Значок советский', 'Набор значков'],
    'Антиквариат': ['Антикварные часы', 'Старинная шкатулка', 'Фарфоровая статуэтка'],
};

const conditions = [
    'Новое, не использовалось', 'Почти новое', 'Хорошее состояние, есть небольшие следы использования',
    'Отличное состояние', 'Рабочее, но есть косметические дефекты', 'Раритет, коллекционное состояние',
];

const cities = ['Псков', 'Москва', 'Санкт-Петербург', 'Великий Новгород', 'Смоленск', 'Тверь', 'Казань', 'Екатеринбург'];
const statuses = ['active', 'active', 'active', 'active', 'reserved', 'exchanged', 'archived'];
const priceRangeByCategory = {
    'Одежда и обувь': [800, 6000], 'Дом и сад': [500, 25000], 'Хобби и творчество': [400, 15000],
    'Спорт и отдых': [1500, 40000], 'Книги и журналы': [150, 3000], 'Музыкальные инструменты': [2000, 60000],
    'Животные и товары для них': [300, 8000], 'Красота и здоровье': [300, 7000], 'Детские товары': [500, 20000],
    'Инструменты и стройматериалы': [700, 25000], 'Электроника': [2000, 90000], 'Коллекционирование': [500, 30000],
};

// Имя и фамилия берутся из пары одного пола, иначе получаются нечитаемые
// сочетания вроде «Гусева Игорь» — это и было причиной переделки.
const namesByGender = {
    male: {
        first: ['Александр', 'Дмитрий', 'Никита', 'Владимир', 'Артём', 'Максим', 'Игорь', 'Денис', 'Михаил', 'Кирилл', 'Егор', 'Роман'],
        last: ['Кузнецов', 'Попов', 'Соколов', 'Фёдоров', 'Захаров', 'Борисов', 'Медведев', 'Гришин', 'Волков', 'Никитин', 'Морозов', 'Воробьёв'],
    },
    female: {
        first: ['Мария', 'Анна', 'Екатерина', 'Юлия', 'Виктория', 'Полина', 'Кристина', 'Алина', 'Наталья', 'Ольга', 'Дарья', 'София'],
        last: ['Кузнецова', 'Попова', 'Соколова', 'Фёдорова', 'Захарова', 'Борисова', 'Медведева', 'Гришина', 'Волкова', 'Никитина', 'Морозова', 'Воробьёва'],
    },
};

// ---------- сборка категорий ----------
const categoryRows = [];
for (const [topName, icon, subs] of catalog) {
    const topId = `bulk-cat-${topName}`;
    categoryRows.push({ category_id: uuid(topId), name: topName, icon, parent_id: null });
    for (const subName of subs) {
        categoryRows.push({ category_id: uuid(`${topId}::${subName}`), name: subName, icon, parent_id: uuid(topId) });
    }
}

// ---------- сборка продавцов ----------
const sellerCount = 24;
const customerRows = [];
const usedFullNames = new Set();
for (let i = 0; i < sellerCount; i++) {
    let fullName, gender;
    for (let attempt = 0; attempt < 20; attempt++) {
        const r = rng(`bulk-customer-${i}-name-${attempt}`);
        gender = r() < 0.5 ? 'male' : 'female';
        const pool = namesByGender[gender];
        fullName = `${pick(r, pool.last)} ${pick(r, pool.first)}`;
        if (!usedFullNames.has(fullName)) break;
    }
    usedFullNames.add(fullName);
    customerRows.push({
        customer_id: uuid(`bulk-customer-${i}`),
        email: `bulk.seller${i}@example.com`,
        password_hash: passwordHash,
        full_name: fullName,
        is_active: true,
    });
}

// ---------- сборка товаров ----------
const productRows = [];
let productIndex = 0;
for (const [topName, , subs] of catalog) {
    const [priceMin, priceMax] = priceRangeByCategory[topName];
    for (const subName of subs) {
        const subId = uuid(`bulk-cat-${topName}::${subName}`);
        const nouns = nounsBySub[subName] ?? [subName];
        for (const noun of nouns) {
            const r = rng(`bulk-product-${productIndex}`);
            const condition = pick(r, conditions);
            const seller = customerRows[int(r, 0, customerRows.length - 1)];
            const price = round(int(r, priceMin, priceMax), 50);
            const daysAgo = int(r, 0, 90);
            const createdAt = new Date(Date.UTC(2026, 7, 12) - daysAgo * 86400000).toISOString();
            const productId = uuid(`bulk-product-${productIndex}`);
            const templates = [
                `${condition}. Продаю в связи с ненадобностью, ${noun.toLowerCase()} исправен(на) и готов(а) к использованию.`,
                `${condition}. Рассмотрю обмен на что-то полезное из категории «${subName}».`,
                `${condition}. Покупал(а) недавно, но не подошло — теперь ищу обмен получше.`,
                `${condition}. Полный комплект, документы и упаковка сохранены.`,
                `${condition}. Использовал(а) бережно, все функции и механизмы работают исправно.`,
                `${condition}. Отдам с доплатой или без — интересны варианты обмена.`,
            ];
            productRows.push({
                product_id: productId,
                customer_id: seller.customer_id,
                category_id: subId,
                title: noun,
                description: pick(r, templates),
                image: svgPlaceholder(productId, noun.slice(0, 2).toUpperCase()),
                price,
                location: pick(r, cities),
                status: pick(r, statuses),
                created_at: createdAt,
                updated_at: createdAt,
            });
            productIndex++;
        }
    }
}

const sqlOut = [
    '-- GENERATED FILE. Source: scripts/generate-bulk-test-data.mjs.',
    '-- Regenerate with: node scripts/generate-bulk-test-data.mjs',
    '-- Массовое наполнение витрины: процедурные категории/товары/SVG-картинки',
    '-- для демонстрации поиска и каталога на большом объёме данных.',
    'BEGIN;',
    insert('categories', ['category_id', 'name', 'icon', 'parent_id'], categoryRows),
    insert('customers', ['customer_id', 'email', 'password_hash', 'full_name', 'is_active'], customerRows),
    insert('products', ['product_id', 'customer_id', 'category_id', 'title', 'description', 'image', 'price', 'location', 'status', 'created_at', 'updated_at'], productRows),
    'COMMIT;\n',
].join('\n');

await writeFile(outputPath, sqlOut, 'utf8');
console.log(`Категорий: ${categoryRows.length}, продавцов: ${customerRows.length}, товаров: ${productRows.length}`);
console.log(`Создан ${outputPath.pathname}`);
