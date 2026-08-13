/**
 * Чинит имена тестовых продавцов (были собраны из несогласованных по полу
 * имени/фамилии — «Гусева Игорь», «Фёдоров Кристина») и добавляет им
 * случайные отзывы, чтобы профили не выглядели пустыми.
 *
 * Отзывы используют chain_id = NULL: колонка специально сделана nullable
 * в 004_exchange_negotiation.sql для отзывов вне привязки к конкретному
 * завершённому обмену. Все customer_id/product_id берутся из уже
 * существующих строк, поэтому висячих ссылок не возникает.
 *
 * Запуск: node scripts/generate-social-proof.mjs <products_by_owner.csv>
 * products_by_owner.csv — вывод
 *   `psql -t -A -F',' -c "SELECT customer_id, product_id FROM products;"`
 * Результат: back/infrastructure/migrations/016_customer_names_and_reviews.sql
 */
import { createHash } from 'node:crypto';
import { writeFile, readFile } from 'node:fs/promises';

const outputPath = new URL('../back/infrastructure/migrations/016_customer_names_and_reviews.sql', import.meta.url);
const uuidNamespace = '6ba7b8119dad11d180b400c04fd430c8';
const csvPath = process.argv[2];
if (!csvPath) {
    console.error('Использование: node scripts/generate-social-proof.mjs <products_by_owner.csv>');
    process.exit(1);
}

function uuid(sourceId) {
    const namespace = Buffer.from(uuidNamespace, 'hex');
    const hash = createHash('sha1').update(namespace).update(sourceId).digest();
    hash[6] = (hash[6] & 0x0f) | 0x50;
    hash[8] = (hash[8] & 0x3f) | 0x80;
    const hex = hash.subarray(0, 16).toString('hex');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
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
function sqlVal(raw) {
    if (raw === null || raw === undefined) return 'NULL';
    if (typeof raw === 'number') return String(raw);
    return `'${String(raw).replaceAll("'", "''")}'`;
}

// ---------- та же схема имён, что и в generate-bulk-test-data.mjs ----------
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

const sellerCount = 24;
const usedFullNames = new Set();
const bulkCustomers = [];
for (let i = 0; i < sellerCount; i++) {
    let fullName;
    for (let attempt = 0; attempt < 20; attempt++) {
        const r = rng(`bulk-customer-${i}-name-${attempt}`);
        const gender = r() < 0.5 ? 'male' : 'female';
        const pool = namesByGender[gender];
        fullName = `${pick(r, pool.last)} ${pick(r, pool.first)}`;
        if (!usedFullNames.has(fullName)) break;
    }
    usedFullNames.add(fullName);
    bulkCustomers.push({ customer_id: uuid(`bulk-customer-${i}`), source: `bulk-customer-${i}`, full_name: fullName });
}

// Демо-продавцы из 006_seed_mock_data.sql — их full_name уже корректный
// (проставлен в 011_customer_full_name.sql), имена не трогаем, но они
// участвуют в раздаче отзывов наравне с остальными.
const demoSourceIds = Array.from({ length: 11 }, (_, i) => `user-pskov-${String(i + 1).padStart(2, '0')}`);
const demoCustomers = demoSourceIds.map((source) => ({ customer_id: uuid(source), source }));

const allCustomers = [...demoCustomers, ...bulkCustomers];

// ---------- владение товарами (для правдоподобного product_id в отзыве) ----------
const csv = await readFile(csvPath, 'utf8');
const productsByOwner = new Map();
for (const line of csv.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const [customerId, productId] = trimmed.split(',');
    if (!productsByOwner.has(customerId)) productsByOwner.set(customerId, []);
    productsByOwner.get(customerId).push(productId);
}

// ---------- отзывы ----------
// Комментарий подбирается по тону под уже выпавший рейтинг — иначе
// получаются нелепости вроде «рейтинг 1, текст „прекрасный опыт“».
const commentsByTier = {
    positive: [
        'Быстро договорились, вещь полностью соответствует описанию.',
        'Общение прошло легко, рекомендую как надёжного партнёра по обмену.',
        'Встретились без задержек, всё было как договаривались.',
        'Прекрасный опыт обмена, обязательно свяжусь снова.',
        'Всё чётко, вопросов не осталось.',
        'Отличный собеседник, обмен прошёл гладко.',
    ],
    neutral: [
        'Хорошее впечатление, но пришлось немного подождать ответа.',
        'Вещь оказалась чуть хуже по состоянию, чем ожидал(а), но в целом всё нормально.',
        'Задержался с ответом на сообщения, но в итоге всё решили.',
        'Вежливо предупредил(а) о нюансах заранее, обмен прошёл честно.',
    ],
    negative: [
        'Условия обмена немного отличались от заявленных — будьте внимательны.',
        'Долго не выходил(а) на связь, пришлось напоминать несколько раз.',
        'Вещь пришла в заметно худшем состоянии, чем было описано.',
        'Несколько раз переносил(а) встречу без предупреждения.',
    ],
};
// Смещение к позитивным оценкам — как на большинстве живых платформ.
const ratingPool = [5, 5, 5, 5, 4, 4, 4, 3, 3, 2, 1];
const tierForRating = (rating) => (rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative');

const reviewRows = [];
for (const to of allCustomers) {
    const rCount = rng(`review-count-${to.source}`);
    const count = int(rCount, 0, 5);
    const candidates = allCustomers.filter((c) => c.customer_id !== to.customer_id);
    // Детерминированная перетасовка кандидатов под конкретного получателя.
    const rShuffle = rng(`review-shuffle-${to.source}`);
    const shuffled = [...candidates].sort(() => rShuffle() - 0.5);
    const reviewers = shuffled.slice(0, count);

    for (const from of reviewers) {
        const r = rng(`review-${to.source}-${from.source}`);
        const ownedProducts = productsByOwner.get(to.customer_id) ?? [];
        const productId = ownedProducts.length > 0 ? pick(r, ownedProducts) : null;
        const daysAgo = int(r, 0, 120);
        const createdAt = new Date(Date.UTC(2026, 7, 12) - daysAgo * 86400000).toISOString();
        const rating = pick(r, ratingPool);
        reviewRows.push({
            review_id: uuid(`bulk-review-${to.source}-${from.source}`),
            chain_id: null,
            from_customer_id: from.customer_id,
            to_customer_id: to.customer_id,
            product_id: productId,
            rating,
            comment: pick(r, commentsByTier[tierForRating(rating)]),
            created_at: createdAt,
            updated_at: createdAt,
        });
    }
}

// ---------- сборка SQL ----------
const nameUpdates = bulkCustomers
    .map((c) => `UPDATE customers SET full_name = ${sqlVal(c.full_name)} WHERE customer_id = ${sqlVal(c.customer_id)};`)
    .join('\n');

const reviewColumns = ['review_id', 'chain_id', 'from_customer_id', 'to_customer_id', 'product_id', 'rating', 'comment', 'created_at', 'updated_at'];
const reviewInsert = reviewRows.length > 0
    ? `INSERT INTO reviews (${reviewColumns.join(', ')}) VALUES\n${reviewRows
          .map((row) => `    (${reviewColumns.map((c) => sqlVal(row[c])).join(', ')})`)
          .join(',\n')}\nON CONFLICT DO NOTHING;\n`
    : '';

const sqlOut = [
    '-- GENERATED FILE. Source: scripts/generate-social-proof.mjs.',
    '-- Regenerate with: node scripts/generate-social-proof.mjs <products_by_owner.csv>',
    '--',
    '-- Часть 1: имена тестовых продавцов из 014_bulk_test_data.sql были собраны',
    '-- из имени и фамилии разного пола («Гусева Игорь»). Правим по customer_id',
    '-- безусловно — это синтетические bulk.sellerN@example.com-аккаунты, их',
    '-- никто вручную не редактировал.',
    '--',
    '-- Часть 2: отзывы у тестовых продавцов и демо-аккаунтов, чтобы профили',
    '-- не выглядели пустыми. chain_id = NULL — отзыв не привязан к конкретной',
    '-- сделке (колонка nullable специально под этот случай, см.',
    '-- 004_exchange_negotiation.sql). from/to/product ссылаются на уже',
    '-- существующие строки, висячих ссылок не возникает.',
    'BEGIN;',
    nameUpdates,
    '',
    reviewInsert,
    'COMMIT;\n',
].join('\n');

await writeFile(outputPath, sqlOut, 'utf8');
console.log(`Исправлено имён: ${bulkCustomers.length}`);
console.log(`Сгенерировано отзывов: ${reviewRows.length}`);
console.log(`Создан ${outputPath.pathname}`);
